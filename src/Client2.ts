import { devMsg } from "./lib/devMsg"
import { getPreviewCookie } from "./lib/getPreviewCookie"
import {
	type AbortSignalLike,
	type FetchLike,
	type RequestInitLike,
	type ResponseLike,
	request,
} from "./lib/request"
import { throttledWarn } from "./lib/throttledWarn"

import type { Query } from "./types/api/query"
import type { Ref } from "./types/api/ref"
import type { Repository } from "./types/api/repository"
import type { PrismicDocument } from "./types/value/document"

import {
	ContentAPIError,
	DocumentNotFoundError,
	ForbiddenError,
	NotFoundError,
	ParsingError,
	PreviewTokenExpiredError,
	PrismicError,
	RefExpiredError,
	RefNotFoundError,
	ReleaseNotFoundError,
	RepositoryNotFoundError,
} from "./errors"

import { type LinkResolverFunction, asLink } from "./helpers/asLink"

import {
	type BuildQueryURLArgs,
	type Route,
	buildQueryURL,
} from "./buildQueryURL"
import { filter } from "./filter"
import { getRepositoryEndpoint } from "./getRepositoryEndpoint"
import { getRepositoryName } from "./getRepositoryName"
import { isRepositoryEndpoint } from "./isRepositoryEndpoint"

const REPOSITORY_CACHE_TTL = 5000
const MAX_INVALID_REF_RETRY_ATTEMPTS = 3
const MAX_PAGE_SIZE = 100
const GET_ALL_QUERY_DELAY = 500

type ExtractDocumentType<
	TDocuments extends PrismicDocument,
	TDocumentType extends TDocuments["type"],
> =
	Extract<TDocuments, { type: TDocumentType }> extends never
		? TDocuments
		: Extract<TDocuments, { type: TDocumentType }>

export type ClientConfig = {
	documentAPIEndpoint?: string
	accessToken?: string
	ref?: string | GetRef
	routes?: Route[]
	brokenRoute?: string
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>
	fetchOptions?: RequestInitLike
	fetch?: FetchLike
}

export type HttpRequestLike =
	| {
			headers: {
				get(name: string): string | null
			}
			url: string
	  }
	| {
			headers: {
				cookie?: string
			}
			query: Record<string, unknown>
	  }

type FetchParams = {
	fetchOptions?: RequestInitLike
	/**
	 * @deprecated Move the `signal` parameter into `fetchOptions.signal`:
	 */
	signal?: AbortSignalLike
}

type GetAllParams = {
	limit?: number
}

type GetRef = (
	params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
) => string | undefined | Promise<string | undefined>

type ResolvePreviewArgs = {
	linkResolver?: LinkResolverFunction
	defaultURL: string
	previewToken?: string
	documentID?: string
}

export class Client<TDocuments extends PrismicDocument = PrismicDocument> {
	#repositoryName: string | undefined

	set repositoryName(value: string) {
		this.#repositoryName = value
	}

	get repositoryName(): string {
		if (!this.#repositoryName) {
			throw new PrismicError(
				`A repository name is required for this method but one could not be inferred from the provided API endpoint (\`${this.documentAPIEndpoint}\`). To fix this error, provide a repository name when creating the client. For more details, see ${devMsg("prefer-repository-name")}`,
			)
		}

		return this.#repositoryName
	}

	/**
	 * The client's Content API endpoint.
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
	 */
	documentAPIEndpoint: string
	/**
	 * The access token used for the Content API.
	 *
	 * @see {@link https://prismic.io/docs/fetch-content#content-visibility}
	 */
	accessToken?: string
	/**
	 * A list of route resolver objects that define how a document's `url` field
	 * is resolved.
	 *
	 * @see {@link https://prismic.io/docs/routes}
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
	 */
	routes?: Route[]
	/**
	 * The URL used for link or content relationship fields that point to an
	 * archived or deleted page.
	 *
	 * @see {@link https://prismic.io/docs/routes}
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
	 */
	brokenRoute?: string
	/**
	 * Default parameters sent with each Content API request. These parameters can
	 * be overridden on each method.
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
	 */
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>
	/**
	 * Default `fetch` options sent with each Content API request. These
	 * parameters can be overriden on each method.
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
	 */
	fetchOptions: RequestInitLike
	/**
	 * The `fetch` function used to make network requests.
	 *
	 * @default The global `fetch` function.
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
	 */
	fetch: FetchLike

	#cachedRepository?: Repository
	#cachedRepositoryExpiration = 0
	#getRef?: GetRef
	#autoPreviews = true
	#autoPreviewsRequest?: HttpRequestLike

	constructor(repositoryNameOrEndpoint: string, config: ClientConfig = {}) {
		const {
			documentAPIEndpoint,
			accessToken,
			ref,
			routes,
			brokenRoute,
			defaultParams,
			fetchOptions = {},
			fetch = globalThis.fetch,
		} = config

		// TODO: Simplify in v8 when endpoints are not supported as the first argument.
		if (isRepositoryEndpoint(repositoryNameOrEndpoint)) {
			console.warn(
				`[@prismicio/client] Passing an endpoint URL as the first argument is deprecated. Pass the repository name instead and use the \`documentAPIEndpoint\` option if needed. For more details, see ${devMsg("prefer-repository-name")}`,
			)
			try {
				this.repositoryName = getRepositoryName(repositoryNameOrEndpoint)
			} catch {
				console.warn(
					`[@prismicio/client] A repository name could not be inferred from the provided endpoint (\`${repositoryNameOrEndpoint}\`). Some methods will be disabled. Create the client using a repository name to prevent this warning. For more details, see ${devMsg("prefer-repository-name")}`,
				)
			}
			this.documentAPIEndpoint = documentAPIEndpoint || repositoryNameOrEndpoint
		} else {
			this.repositoryName = repositoryNameOrEndpoint
			this.documentAPIEndpoint =
				documentAPIEndpoint || getRepositoryEndpoint(repositoryNameOrEndpoint)
		}

		if (!fetch)
			throw new TypeError(
				`A fetch implementation must be provided via the \`fetch\` config`,
			)
		if (typeof fetch !== "function")
			throw new TypeError(
				`fetch must be a function but received: ${typeof fetch}`,
			)
		if (!isRepositoryEndpoint(this.documentAPIEndpoint))
			throw new TypeError(
				`documentAPIEndpoint is not a valid URL: ${documentAPIEndpoint}`,
			)
		// TODO: Throw in all environments in v8.
		if (
			/\.prismic\.io\/(?!api\/v2\/?)/i.test(this.documentAPIEndpoint) &&
			process.env.NODE_ENV === "development"
		)
			throw new TypeError(
				`@prismicio/client only supports Content API with the /api/v2 path`,
			)
		// TODO: Throw in all environments in v8.
		if (
			/(?<!\.cdn)\.prismic\.io$/i.test(
				new URL(this.documentAPIEndpoint).hostname,
			) &&
			process.env.NODE_ENV === "development"
		)
			console.warn(
				`[@prismicio/client] The client was created with a non-CDN endpoint. Convert it to the CDN endpoint for better performance. For more details, see ${devMsg("endpoint-must-use-cdn")}`,
			)

		this.accessToken = accessToken
		this.routes = routes
		this.brokenRoute = brokenRoute
		this.defaultParams = defaultParams
		this.fetchOptions = fetchOptions
		this.fetch = fetch

		if (ref) this.queryContentFromRef(ref)
	}

	/**
	 * @deprecated Renamed to `fetch`.
	 */
	get fetchFn(): FetchLike {
		return this.fetch
	}

	/**
	 * @deprecated Renamed to `fetch`.
	 */
	set fetchFn(fetch: FetchLike) {
		this.fetch = fetch
	}

	/**
	 * @deprecated Use `documentAPIEndpoint` instead.
	 */
	// TODO: Remove in v8.
	get endpoint(): string {
		return this.documentAPIEndpoint
	}

	/**
	 * @deprecated Use `documentAPIEndpoint` instead.
	 */
	// TODO: Remove in v8.
	set endpoint(value: string) {
		this.documentAPIEndpoint = value
	}

	/**
	 * Fetches pages based on the `params` argument. Results are paginated.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.get({ pageSize: 10 })
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#get}
	 */
	async get<TDocument extends TDocuments>(
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		const response = await this.#internalGet(params)
		return await response.json()
	}

	/**
	 * Fetches the first page returned based on the `params` argument.
	 *
	 * @example
	 *
	 * ```ts
	 * const page = await client.getFirst()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getfirst}
	 */
	async getFirst<TDocument extends TDocuments>(
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<TDocument> {
		const actualParams =
			params?.page || params?.pageSize ? params : { ...params, pageSize: 1 }
		const response = await this.#internalGet(actualParams)
		const { results }: Query<TDocument> = await response.clone().json()
		if (results[0]) return results[0]

		throw new DocumentNotFoundError("No documents were returned", { response })
	}

	async dangerouslyGetAll<TDocument extends TDocuments>(
		params: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams = {},
	): Promise<TDocument[]> {
		const { limit = Infinity, ...otherParams } = params
		const resolvedParams = {
			...otherParams,
			pageSize: Math.min(
				limit,
				otherParams.pageSize || this.defaultParams?.pageSize || MAX_PAGE_SIZE,
			),
		}

		const pages: TDocument[] = []
		let latestResult: Query<TDocument> | undefined

		while ((!latestResult || latestResult.next_page) && pages.length < limit) {
			const page = latestResult ? latestResult.page + 1 : resolvedParams.page
			latestResult = await this.get<TDocument>({ ...resolvedParams, page })
			pages.push(...latestResult.results)

			if (latestResult.next_page)
				await new Promise((resolve) => setTimeout(resolve, GET_ALL_QUERY_DELAY))
		}

		return pages.slice(0, limit)
	}

	/**
	 * Fetches a page with a specific ID.
	 *
	 * @example
	 *
	 * ```ts
	 * const page = await client.getByID("WW4bKScAAMAqmluX")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyid}
	 */
	async getByID<TDocument extends TDocuments>(
		id: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<TDocument> {
		return this.getFirst(appendFilters(params, filter.at("document.id", id)))
	}

	/**
	 * Fetches pages with specific IDs. Results are paginated.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByIDs([
	 * 	"WW4bKScAAMAqmluX",
	 * 	"U1kTRgEAAC8A5ldS",
	 * ])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyids}
	 */
	async getByIDs<TDocument extends TDocuments>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return this.get(appendFilters(params, filter.in("document.id", ids)))
	}

	/**
	 * Fetches pages with specific IDs. This method may make multiple network
	 * requests to fetch all matching pages.
	 *
	 * @example
	 *
	 * ```ts
	 * const pages = await client.getAllByIDs([
	 * 	"WW4bKScAAMAqmluX",
	 * 	"U1kTRgEAAC8A5ldS",
	 * ])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbyids}
	 */
	async getAllByIDs<TDocument extends TDocuments>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<TDocument[]> {
		return this.dangerouslyGetAll(
			appendFilters(params, filter.in("document.id", ids)),
		)
	}

	/**
	 * Fetches a page with a specific UID and type.
	 *
	 * @example
	 *
	 * ```ts
	 * const page = await client.getByUID("blog_post", "my-first-post")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyuid}
	 */
	async getByUID<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		uid: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return this.getFirst(
			appendFilters(
				params,
				filter.at("document.type", type),
				filter.at(`my.${type}.uid`, uid),
			),
		)
	}

	/**
	 * Fetches pages with specific UIDs and a specific type. Results are
	 * paginated.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByUIDs("blog_post", [
	 * 	"my-first-post",
	 * 	"my-second-post",
	 * ])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyuids}
	 */
	async getByUIDs<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		uids: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return this.get(
			appendFilters(
				params,
				filter.at("document.type", type),
				filter.in(`my.${type}.uid`, uids),
			),
		)
	}

	/**
	 * Fetches pages with specific UIDs and a specific type. This method may make
	 * multiple network requests to fetch all matching pages.
	 *
	 * @example
	 *
	 * ```ts
	 * const pages = await client.getAllByUIDs("blog_post", [
	 * 	"my-first-post",
	 * 	"my-second-post",
	 * ])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbyuids}
	 */
	async getAllByUIDs<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		uids: string[],
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return this.dangerouslyGetAll(
			appendFilters(
				params,
				filter.at("document.type", type),
				filter.in(`my.${type}.uid`, uids),
			),
		)
	}

	/**
	 * Fetches a specific single type page.
	 *
	 * @example
	 *
	 * ```ts
	 * const page = await client.getSingle("settings")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getsingle}
	 */
	async getSingle<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return this.getFirst(
			appendFilters(params, filter.at("document.type", type)),
		)
	}

	/**
	 * Fetches pages with a specific type. Results are paginated.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByType("blog_post")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbytype}
	 */
	async getByType<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return this.get(appendFilters(params, filter.at("document.type", type)))
	}

	/**
	 * Fetches pages with a specific type. This method may make multiple network
	 * requests to fetch all matching documents.
	 *
	 * @example
	 *
	 * ```ts
	 * const pages = await client.getAllByType("blog_post")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbytype}
	 */
	async getAllByType<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return this.dangerouslyGetAll(
			appendFilters(params, filter.at("document.type", type)),
		)
	}

	/**
	 * Fetches pages with a specific tag. Results are paginated.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByTag("featured")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbytag}
	 */
	async getByTag<TDocument extends TDocuments>(
		tag: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return this.getBySomeTags([tag], params)
	}

	/**
	 * Fetches pages with a specific tag. This method may make multiple network
	 * requests to fetch all matching documents.
	 *
	 * @example
	 *
	 * ```ts
	 * const pages = await client.getAllByTag("featured")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbytag}
	 */
	async getAllByTag<TDocument extends TDocuments>(
		tag: string,
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<TDocument[]> {
		return this.getAllBySomeTags([tag], params)
	}

	/**
	 * Fetches pages with every tag from a list of tags. Results are paginated.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByEveryTag(["featured", "homepage"])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyeverytag}
	 */
	async getByEveryTag<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return this.get(appendFilters(params, filter.at("document.tags", tags)))
	}

	/**
	 * Fetches pages with every tag from a list of tags. This method may make
	 * multiple network requests to fetch all matching pages.
	 *
	 * @example
	 *
	 * ```ts
	 * const pages = await client.getAllByEveryTag(["featured", "homepage"])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbyeverytag}
	 */
	async getAllByEveryTag<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<TDocument[]> {
		return this.dangerouslyGetAll(
			appendFilters(params, filter.at("document.tags", tags)),
		)
	}

	/**
	 * Fetches pages with at least one tag from a list of tags. Results are
	 * paginated.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getBySomeTags(["featured", "homepage"])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbysometags}
	 */
	async getBySomeTags<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return this.get(appendFilters(params, filter.any("document.tags", tags)))
	}

	/**
	 * Fetches pages with at least one tag from a list of tags. This method may
	 * make multiple network requests to fetch all matching documents.
	 *
	 * @example
	 *
	 * ```ts
	 * const pages = await client.getAllBySomeTags(["featured", "homepage"])
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbysometags}
	 */
	async getAllBySomeTags<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<TDocument[]> {
		return this.dangerouslyGetAll(
			appendFilters(params, filter.any("document.tags", tags)),
		)
	}

	/**
	 * Fetches metadata about the client's Prismic repository.
	 *
	 * @example
	 *
	 * ```ts
	 * const repository = await client.getRepository()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrepository}
	 */
	async getRepository(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Repository> {
		if (this.#cachedRepository && this.#cachedRepositoryExpiration > Date.now())
			return this.#cachedRepository

		const url = new URL(this.documentAPIEndpoint)
		const accessToken = params?.accessToken || this.accessToken
		if (accessToken) url.searchParams.set("access_token", accessToken)

		const response = await this.#request(url, params)
		if (response.ok) {
			this.#cachedRepository = await response.json()
			this.#cachedRepositoryExpiration = Date.now() + REPOSITORY_CACHE_TTL
			return this.#cachedRepository!
		}

		if (response.status === 404) {
			throw new RepositoryNotFoundError(
				`Prismic repository not found. Check that "${this.documentAPIEndpoint}" is pointing to the correct repository.`,
				{ response },
			)
		}

		return await this.#throwContentAPIError(response)
	}

	/**
	 * Fetches the repository's active refs.
	 *
	 * @example
	 *
	 * ```ts
	 * const refs = await client.getRefs()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrefs}
	 */
	async getRefs(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref[]> {
		const repository = await this.getRepository(params)
		return repository.refs
	}

	async getRefByID(
		id: string,
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const refs = await this.getRefs(params)
		const ref = refs.find((ref) => ref.id === id)
		if (ref) return ref

		throw new RefNotFoundError(`Ref with ID "${id}" does not exist.`)
	}

	/**
	 * Fetches a ref by its label. A release ref's label is its name shown in the
	 * Page Builder.
	 *
	 * @example
	 *
	 * ```ts
	 * const ref = await client.getRefByLabel("My Release")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrefbylabel}
	 */
	async getRefByLabel(
		label: string,
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const refs = await this.getRefs(params)
		const ref = refs.find((ref) => ref.label === label)
		if (ref) return ref

		throw new RefNotFoundError(`Ref with label "${label}" does not exist.`)
	}

	/**
	 * Fetches the repository's master ref.
	 *
	 * @example
	 *
	 * ```ts
	 * const masterRef = await client.getMasterRef()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getmasterref}
	 */
	async getMasterRef(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const refs = await this.getRefs(params)
		const ref = refs.find((ref) => ref.isMasterRef)
		if (ref) return ref

		throw new RefNotFoundError("No master ref found.")
	}

	/**
	 * Fetches the repository's active releases.
	 *
	 * @example
	 *
	 * ```ts
	 * const releases = await client.getReleases()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getreleases}
	 */
	async getReleases(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref[]> {
		const refs = await this.getRefs(params)
		return refs.filter((ref) => !ref.isMasterRef)
	}

	/**
	 * Fetches a release with a specific ID.
	 *
	 * @example
	 *
	 * ```ts
	 * const release = await client.getReleaseByID("YhE3YhEAACIA4321")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getreleasebyid}
	 */
	async getReleaseByID(
		id: string,
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const releases = await this.getReleases(params)
		const release = releases.find((release) => release.id === id)
		if (release) return release

		throw new ReleaseNotFoundError(`Release with ID "${id}" does not exist.`)
	}

	/**
	 * Fetches a release by its label. A release ref's label is its name shown in
	 * the Page Builder.
	 *
	 * @example
	 *
	 * ```ts
	 * const release = await client.getReleaseByLabel("My Release")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getreleasebylabel}
	 */
	async getReleaseByLabel(
		label: string,
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const releases = await this.getReleases(params)
		const release = releases.find((release) => release.label === label)
		if (release) return release

		throw new ReleaseNotFoundError(
			`Release with label "${label}" does not exist.`,
		)
	}

	/**
	 * Fetches the repository's page tags.
	 *
	 * @example
	 *
	 * ```ts
	 * const tags = await client.getTags()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#gettags}
	 */
	async getTags(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<string[]> {
		const repository = await this.getRepository(params)
		const form = repository.forms.tags
		if (form) {
			const url = new URL(form.action)
			const accessToken = params?.accessToken || this.accessToken
			if (accessToken) url.searchParams.set("access_token", accessToken)

			const response = await this.#request(url, params)
			if (response.ok) return await response.json()
		}

		return repository.tags
	}

	/**
	 * Configures the client to query the latest published content. This is the
	 * client's default mode.
	 *
	 * @example
	 *
	 * ```ts
	 * client.queryLatestContent()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querylatestcontent}
	 */
	queryLatestContent(): void {
		this.#getRef = undefined
	}

	/**
	 * Configures the client to query content from a release with a specific ID.
	 *
	 * @example
	 *
	 * ```ts
	 * client.queryContentFromReleaseByID("YhE3YhEAACIA4321")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querycontentfromreleasebyid}
	 */
	queryContentFromReleaseByID(id: string): void {
		this.#getRef = async (params) => {
			const release = await this.getReleaseByID(id, params)
			return release.ref
		}
	}

	/**
	 * Configures the client to query content from a release with a specific
	 * label.
	 *
	 * @example
	 *
	 * ```ts
	 * client.queryContentFromReleaseByLabel("My Release")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querycontentfromreleasebylabel}
	 */
	queryContentFromReleaseByLabel(label: string): void {
		this.#getRef = async (params) => {
			const release = await this.getReleaseByLabel(label, params)
			return release.ref
		}
	}

	/**
	 * Configures the client to query content from a specific ref.
	 *
	 * @example
	 *
	 * ```ts
	 * client.queryContentFromRef("my-ref")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querycontentfromref}
	 */
	queryContentFromRef(ref: string | GetRef): void {
		this.#getRef = typeof ref === "string" ? () => ref : ref
	}

	enableAutoPreviews(): void {
		this.#autoPreviews = true
	}

	enableAutoPreviewsFromReq(request: HttpRequestLike): void {
		this.enableAutoPreviews()
		this.#autoPreviewsRequest = request
	}

	disableAutoPreviews(): void {
		this.#autoPreviews = false
		this.#autoPreviewsRequest = undefined
	}

	/**
	 * Builds a Content API query URL with a set of parameters.
	 *
	 * @example
	 *
	 * ```ts
	 * const url = await client.buildQueryURL({
	 * 	filters: [filter.at("document.type", "blog_post")],
	 * })
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#buildqueryurl}
	 */
	async buildQueryURL(
		params: Partial<BuildQueryURLArgs> & FetchParams = {},
	): Promise<string> {
		const ref = params?.ref || (await this.#getResolvedRef(params))
		let integrationFieldsRef = params?.integrationFieldsRef
		if (!integrationFieldsRef) {
			const repository = await this.getRepository(params)
			integrationFieldsRef = repository.integrationFieldsRef ?? undefined
		}

		const { fetchOptions: _fetchOptions, ...queryParams } = params
		return buildQueryURL(this.documentAPIEndpoint, {
			...this.defaultParams,
			...queryParams,
			ref,
			integrationFieldsRef,
			routes: params.routes || this.routes,
			brokenRoute: params.brokenRoute || this.brokenRoute,
			accessToken: params.accessToken || this.accessToken,
		})
	}

	/**
	 * Fetches a previewed page's URL using a preview token and page ID.
	 *
	 * @example
	 *
	 * ```ts
	 * const url = await client.resolvePreviewURL({
	 * 	linkResolver,
	 * 	defaultURL: "/",
	 * })
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#resolvepreviewurl}
	 */
	async resolvePreviewURL(
		args: ResolvePreviewArgs & FetchParams,
	): Promise<string> {
		let { documentID, previewToken, defaultURL, linkResolver, ...params } = args

		if (this.#autoPreviewsRequest) {
			if ("url" in this.#autoPreviewsRequest) {
				// Including "protocol://" handles a case where
				// Next.js Route Handlers only provide the
				// pathname and search parameters in the `url`
				// property (e.g. `/api/preview?foo=bar`).
				const url = new URL(this.#autoPreviewsRequest.url, "protocol://")
				documentID ||= url.searchParams.get("documentId") ?? undefined
				previewToken ||= url.searchParams.get("token") ?? undefined
			} else {
				documentID ||= this.#autoPreviewsRequest.query.documentId as string
				previewToken ||= this.#autoPreviewsRequest.query.token as string
			}
		} else if (globalThis.location) {
			const searchParams = new URLSearchParams(globalThis.location.search)
			documentID ||= searchParams.get("documentId") ?? undefined
			previewToken ||= searchParams.get("token") ?? undefined
		}

		if (documentID && previewToken) {
			const page = await this.getByID(documentID, {
				...params,
				ref: previewToken,
				lang: "*",
			})
			const url = asLink(page, { linkResolver })
			if (url) return url
		}

		return defaultURL
	}

	/**
	 * A preconfigured `fetch()` function for Prismic's GraphQL API that can be
	 * provided to GraphQL clients.
	 *
	 * @example
	 *
	 * ```ts
	 * import { createClient, getGraphQLEndpoint } from "@prismicio/client"
	 *
	 * const client = createClient("example-prismic-repo")
	 * const graphQLClient = new ApolloClient({
	 * 	link: new HttpLink({
	 * 		uri: getGraphQLEndpoint(client.repositoryName),
	 * 		// Provide `client.graphQLFetch` as the fetch implementation.
	 * 		fetch: client.graphQLFetch,
	 * 		// Using GET is required.
	 * 		useGETForQueries: true,
	 * 	}),
	 * 	cache: new InMemoryCache(),
	 * })
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#graphqlfetch}
	 */
	async graphQLFetch(
		input: RequestInfo,
		init?: RequestInit,
	): Promise<Response> {
		const params = {
			accessToken: this.accessToken,
			fetchOptions: this.fetchOptions,
		}
		const repository = await this.getRepository(params)
		const ref = await this.#getResolvedRef(params)

		const headers: NonNullable<RequestInitLike["headers"]> = {}
		headers["prismic-ref"] = ref
		if (this.accessToken) headers["authorization"] = `Token ${this.accessToken}`
		if (repository.integrationFieldsRef)
			headers["prismic-integration-field-ref"] = repository.integrationFieldsRef
		for (const [key, value] of Object.entries(init?.headers ?? {}))
			headers[key.toLowerCase()] = value

		const url = new URL(typeof input === "string" ? input : input.url)
		const query = (url.searchParams.get("query") ?? "").replace(
			// Minify the query
			/(\n| )*( |{|})(\n| )*/gm,
			(_chars, _spaces, brackets) => brackets,
		)
		url.searchParams.set("query", query)
		// Only used to prevent caching; caches ignore header differences
		url.searchParams.set("ref", ref)

		return (await this.fetch(url.toString(), {
			...init,
			headers,
		})) as Response
	}

	async #internalGet(
		params?: Partial<BuildQueryURLArgs> & FetchParams,
		attempt = 1,
	): Promise<ResponseLike> {
		const url = await this.buildQueryURL(params)
		const response = await this.#request(new URL(url), params)
		if (response.ok) {
			try {
				return response
			} catch (cause) {
				throw new ContentAPIError("Invalid response.", { response, cause })
			}
		}

		try {
			return await this.#throwContentAPIError(response)
		} catch (error) {
			if (
				(error instanceof RefNotFoundError ||
					error instanceof RefExpiredError) &&
				attempt < MAX_INVALID_REF_RETRY_ATTEMPTS
			) {
				// If no explicit ref is given (i.e. the master ref from
				// /api/v2 is used), clear the cached repository value.
				// Clearing the cached value prevents other methods from
				// using a known-stale ref.
				if (!params?.ref) {
					this.#cachedRepository = undefined
				}

				const masterRef = error.message.match(/master ref is: (?<ref>.*)$/i)
					?.groups?.ref
				if (!masterRef) throw error

				const badRef = new URL(url).searchParams.get("ref")
				const issue = error instanceof RefNotFoundError ? "invalid" : "expired"
				throttledWarn(
					`[@prismicio/client] The ref (${badRef}) was ${issue}. Now retrying with the latest master ref (${masterRef}). If you were previewing content, the response will not include draft content.`,
				)

				return await this.#internalGet(
					{ ...params, ref: masterRef },
					attempt + 1,
				)
			}

			throw error
		}
	}

	async #getResolvedRef(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	) {
		if (this.#autoPreviews) {
			const cookies = this.#autoPreviewsRequest
				? "get" in this.#autoPreviewsRequest.headers
					? this.#autoPreviewsRequest.headers.get("cookie")
					: this.#autoPreviewsRequest.headers.cookie
				: globalThis.document?.cookie
			const previewRef = getPreviewCookie(cookies ?? "")
			if (previewRef) return previewRef
		}

		const ref = await this.#getRef?.(params)
		if (ref) return ref

		const masterRef = await this.getMasterRef(params)
		return masterRef.ref
	}

	async #throwContentAPIError(response: ResponseLike): Promise<never> {
		switch (response.status) {
			case 400: {
				const json = await response.clone().json()
				throw new ParsingError(json.message, { response })
			}
			case 401: {
				const json = await response.clone().json()
				throw new ForbiddenError(json.message, { response })
			}
			case 404: {
				const json = await response.clone().json()
				if (json.type === "api_notfound_error") {
					throw new RefNotFoundError(json.message, { response })
				} else if (
					json.type === "api_security_error" &&
					/preview token.*expired/i.test(json.message)
				) {
					throw new PreviewTokenExpiredError(json.message, { response })
				} else {
					throw new NotFoundError(json.message, { response })
				}
			}
			case 410: {
				const json = await response.clone().json()
				throw new RefExpiredError(json.message, { response })
			}
			default: {
				throw new ContentAPIError("An unknown Content API error occured.", {
					response,
				})
			}
		}
	}

	async #request(url: URL, params?: FetchParams): Promise<ResponseLike> {
		const init = {
			...this.fetchOptions,
			...params?.fetchOptions,
			headers: {
				...this.fetchOptions?.headers,
				...params?.fetchOptions?.headers,
			},
			signal:
				params?.fetchOptions?.signal ||
				params?.signal ||
				this.fetchOptions?.signal,
		}

		return await request(url, init, this.fetch)
	}
}

function appendFilters<T extends Pick<BuildQueryURLArgs, "filters">>(
	obj = {} as T,
	...filters: string[]
): T & { filters: string[] } {
	return { ...obj, filters: [...(obj.filters ?? []), ...filters] }
}
