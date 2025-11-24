import { devMsg } from "./lib/devMsg"
import { getPreviewCookie } from "./lib/getPreviewCookie"
import {
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

export type RequestLike =
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
	repositoryName: string
	documentAPIEndpoint: string
	accessToken?: string
	routes?: Route[]
	brokenRoute?: string
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>
	fetchOptions: RequestInitLike
	fetch: FetchLike

	#cachedRepository?: Repository
	#cachedRepositoryExpiration = 0
	#getRef?: GetRef
	#autoPreviews = true
	#autoPreviewsRequest?: RequestLike

	constructor(repositoryName: string, config: ClientConfig = {}) {
		const {
			documentAPIEndpoint = getRepositoryEndpoint(repositoryName),
			accessToken,
			ref,
			routes,
			brokenRoute,
			defaultParams,
			fetchOptions = {},
			fetch = globalThis.fetch,
		} = config

		if (!fetch)
			throw new TypeError(
				`A fetch implementation must be provided via the \`fetch\` config`,
			)
		if (typeof fetch !== "function")
			throw new TypeError(
				`fetch must be a function but received: ${typeof fetch}`,
			)
		if (isRepositoryEndpoint(repositoryName))
			throw new TypeError(
				`createClient's first argument must be a repository name. You may provide a custom endpoint to the documentAPIEndpoint option.`,
			)
		if (!isRepositoryEndpoint(documentAPIEndpoint))
			throw new TypeError(
				`documentAPIEndpoint is not a valid URL: ${documentAPIEndpoint}`,
			)
		if (/\.prismic\.io\/(?!api\/v2\/?)/i.test(documentAPIEndpoint))
			throw new TypeError(
				`@prismicio/client only supports Content API with the /api/v2 path`,
			)
		if (/(?<!\.cdn)\.prismic\.io$/i.test(new URL(documentAPIEndpoint).hostname))
			console.warn(
				`[@prismicio/client] The client was created with a non-CDN endpoint. Convert it to the CDN endpoint for better performance. For more details, see ${devMsg("endpoint-must-use-cdn")}`,
			)

		this.repositoryName = repositoryName
		this.documentAPIEndpoint = documentAPIEndpoint
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

	async get<TDocument extends TDocuments>(
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		const response = await this.#internalGet(params)
		return await response.json()
	}

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

		const documents: TDocument[] = []
		let latestResult: Query<TDocument> | undefined

		while (
			(!latestResult || latestResult.next_page) &&
			documents.length < limit
		) {
			const page = latestResult ? latestResult.page + 1 : resolvedParams.page
			latestResult = await this.get<TDocument>({ ...resolvedParams, page })
			documents.push(...latestResult.results)

			if (latestResult.next_page)
				await new Promise((resolve) => setTimeout(resolve, GET_ALL_QUERY_DELAY))
		}

		return documents.slice(0, limit)
	}

	async getByID<TDocument extends TDocuments>(
		id: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<TDocument> {
		return await this.getFirst(
			appendFilters(params, filter.at("document.id", id)),
		)
	}

	async getByIDs<TDocument extends TDocuments>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get(appendFilters(params, filter.in("document.id", ids)))
	}

	async getAllByIDs<TDocument extends TDocuments>(
		ids: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll(
			appendFilters(params, filter.in("document.id", ids)),
		)
	}

	async getByUID<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		uid: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return await this.getFirst(
			appendFilters(
				params,
				filter.at("document.type", type),
				filter.at(`my.${type}.uid`, uid),
			),
		)
	}

	async getByUIDs<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		uids: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return await this.get(
			appendFilters(
				params,
				filter.at("document.type", type),
				filter.in(`my.${type}.uid`, uids),
			),
		)
	}

	async getAllByUIDs<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		uids: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return await this.dangerouslyGetAll(
			appendFilters(
				params,
				filter.at("document.type", type),
				filter.in(`my.${type}.uid`, uids),
			),
		)
	}

	async getSingle<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return await this.getFirst(
			appendFilters(params, filter.at("document.type", type)),
		)
	}

	async getByType<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return await this.get(
			appendFilters(params, filter.at("document.type", type)),
		)
	}

	async getAllByType<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		type: TDocumentType,
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return await this.dangerouslyGetAll(
			appendFilters(params, filter.at("document.type", type)),
		)
	}

	async getByTag<TDocument extends TDocuments>(
		tag: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get(
			appendFilters(params, filter.any("document.tags", [tag])),
		)
	}

	async getAllByTag<TDocument extends TDocuments>(
		tag: string,
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll(
			appendFilters(params, filter.any("document.tags", [tag])),
		)
	}

	async getByEveryTag<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get(
			appendFilters(params, filter.at("document.tags", tags)),
		)
	}

	async getAllByEveryTag<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll(
			appendFilters(params, filter.at("document.tags", tags)),
		)
	}

	async getBySomeTags<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get(
			appendFilters(params, filter.any("document.tags", tags)),
		)
	}

	async getAllBySomeTags<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll(
			appendFilters(params, filter.any("document.tags", tags)),
		)
	}

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
			const repository: Repository = await response.json()
			this.#cachedRepository = repository
			this.#cachedRepositoryExpiration = Date.now() + REPOSITORY_CACHE_TTL
			return repository
		}

		if (response.status === 404) {
			throw new RepositoryNotFoundError(
				`Prismic repository not found. Check that "${this.documentAPIEndpoint}" is pointing to the correct repository.`,
				{ response },
			)
		}

		return await this.#throwContentAPIError(response)
	}

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

	async getRefByLabel(
		label: string,
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const refs = await this.getRefs(params)
		const ref = refs.find((ref) => ref.label === label)
		if (ref) return ref

		throw new RefNotFoundError(`Ref with label "${label}" does not exist.`)
	}

	async getMasterRef(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const refs = await this.getRefs(params)
		const ref = refs.find((ref) => ref.isMasterRef)
		if (ref) return ref

		throw new RefNotFoundError("No master ref found.")
	}

	async getReleases(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref[]> {
		const refs = await this.getRefs(params)
		return refs.filter((ref) => !ref.isMasterRef)
	}

	async getReleaseByID(
		id: string,
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	): Promise<Ref> {
		const releases = await this.getReleases(params)
		const release = releases.find((release) => release.id === id)
		if (release) return release

		throw new ReleaseNotFoundError(`Release with ID "${id}" does not exist.`)
	}

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

	queryLatestContent(): void {
		this.#getRef = undefined
	}

	queryContentFromReleaseByID(id: string): void {
		this.#getRef = async (params) => {
			const release = await this.getReleaseByID(id, params)
			return release.ref
		}
	}

	queryContentFromReleaseByLabel(label: string): void {
		this.#getRef = async (params) => {
			const release = await this.getReleaseByLabel(label, params)
			return release.ref
		}
	}

	queryContentFromRef(ref: string | GetRef): void {
		this.#getRef = typeof ref === "string" ? () => ref : ref
	}

	enableAutoPreviews(): void {
		this.#autoPreviews = true
	}

	enableAutoPreviewsFromReq(request: RequestLike): void {
		this.enableAutoPreviews()
		this.#autoPreviewsRequest = request
	}

	disableAutoPreviews(): void {
		this.#autoPreviews = false
		this.#autoPreviewsRequest = undefined
	}

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

	async resolvePreviewURL(
		args: ResolvePreviewArgs & FetchParams,
	): Promise<string> {
		let { documentID, previewToken } = args

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
			const document = await this.getByID(documentID, {
				ref: previewToken,
				lang: "*",
				fetchOptions: args.fetchOptions,
			})
			const url = asLink(document, { linkResolver: args.linkResolver })
			if (url) return url
		}

		return args.defaultURL
	}

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
			let cookies: string | null | undefined = globalThis.document?.cookie
			if (this.#autoPreviewsRequest) {
				cookies =
					"get" in this.#autoPreviewsRequest.headers
						? this.#autoPreviewsRequest.headers.get("cookie")
						: this.#autoPreviewsRequest.headers.cookie
			}
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
			signal: params?.fetchOptions?.signal || this.fetchOptions?.signal,
		}

		return await request(url, init, this.fetch)
	}
}

function appendFilters<T extends { filters?: string[] }>(
	obj = {} as T,
	...filters: string[]
): T & { filters: string[] } {
	return { ...obj, filters: [...(obj.filters ?? []), ...filters] }
}
