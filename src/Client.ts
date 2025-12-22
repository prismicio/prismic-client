import { appendFilters } from "./lib/appendFilters"
import { devMsg } from "./lib/devMsg"
import { everyTagFilter } from "./lib/everyTagFilter"
import { findMasterRef } from "./lib/findMasterRef"
import { findRefByID } from "./lib/findRefByID"
import { findRefByLabel } from "./lib/findRefByLabel"
import { getPreviewCookie } from "./lib/getPreviewCookie"
import { minifyGraphQLQuery } from "./lib/minifyGraphQLQuery"
import type { ResponseLike } from "./lib/request"
import {
	type AbortSignalLike,
	type FetchLike,
	type RequestInitLike,
	request,
} from "./lib/request"
import { someTagsFilter } from "./lib/someTagsFilter"
import { throttledLog } from "./lib/throttledLog"
import { typeFilter } from "./lib/typeFilter"

import type { Query } from "./types/api/query"
import type { Ref } from "./types/api/ref"
import type { Repository } from "./types/api/repository"
import type { PrismicDocument } from "./types/value/document"

import { ForbiddenError } from "./errors/ForbiddenError"
import { NotFoundError } from "./errors/NotFoundError"
import { ParsingError } from "./errors/ParsingError"
import { PreviewTokenExpiredError } from "./errors/PreviewTokenExpired"
import { PrismicError } from "./errors/PrismicError"
import { RefExpiredError } from "./errors/RefExpiredError"
import { RefNotFoundError } from "./errors/RefNotFoundError"
import { RepositoryNotFoundError } from "./errors/RepositoryNotFoundError"

import type { LinkResolverFunction } from "./helpers/asLink"
import { asLink } from "./helpers/asLink"

import type { BuildQueryURLArgs } from "./buildQueryURL"
import { buildQueryURL } from "./buildQueryURL"
import { filter } from "./filter"
import { getRepositoryEndpoint } from "./getRepositoryEndpoint"
import { getRepositoryName } from "./getRepositoryName"
import { isRepositoryEndpoint } from "./isRepositoryEndpoint"

/**
 * The largest page size allowed by the Prismic REST API V2. This value is used
 * to minimize the number of requests required to query content.
 */
const MAX_PAGE_SIZE = 100

/**
 * The number of milliseconds in which repository metadata is considered valid.
 * A ref can be invalidated quickly depending on how frequently content is
 * updated in the Prismic repository. As such, repository's metadata can only be
 * considered valid for a short amount of time.
 */
export const REPOSITORY_CACHE_TTL = 5000

/**
 * The number of milliseconds in which a multi-page `getAll` (e.g. `getAll`,
 * `getAllByType`, `getAllByTag`) will wait between individual page requests.
 *
 * This is done to ensure API performance is sustainable and reduces the chance
 * of a failed API request due to overloading.
 */
export const GET_ALL_QUERY_DELAY = 500

/**
 * The maximum number of attempts to retry a query with an invalid ref. We allow
 * multiple attempts since each attempt may use a different (and possibly
 * invalid) ref. Capping the number of attempts prevents infinite loops.
 */
const MAX_INVALID_REF_RETRY_ATTEMPTS = 3

/**
 * Extracts one or more Prismic document types that match a given Prismic
 * document type. If no matches are found, no extraction is performed and the
 * union of all provided Prismic document types are returned.
 *
 * @typeParam TDocuments - Prismic document types from which to extract.
 * @typeParam TDocumentType - Type(s) to match `TDocuments` against.
 */
type ExtractDocumentType<
	TDocuments extends PrismicDocument,
	TDocumentType extends TDocuments["type"],
> =
	Extract<TDocuments, { type: TDocumentType }> extends never
		? TDocuments
		: Extract<TDocuments, { type: TDocumentType }>

/**
 * The minimum required properties to treat as an HTTP Request for automatic
 * Prismic preview support.
 */
export type HttpRequestLike =
	| /**
	 * Web API Request
	 *
	 * @see http://developer.mozilla.org/en-US/docs/Web/API/Request
	 */
	{
			headers?: {
				get(name: string): string | null
			}
			url?: string
	  }

	/**
	 * Express-style Request
	 */
	| {
			headers?: {
				cookie?: string
			}
			query?: Record<string, unknown>
	  }

/**
 * A function that returns a ref string. Used to configure which ref the client
 * queries content from.
 */
type GetRef = (
	params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
) => string | undefined | Promise<string | undefined>

/**
 * Parameters for any client method that use `fetch()`.
 */
export type FetchParams = {
	/**
	 * Options provided to the client's `fetch()` on all network requests. These
	 * options will be merged with internally required options. They can also be
	 * overriden on a per-query basis using the query's `fetchOptions` parameter.
	 */
	fetchOptions?: RequestInitLike

	/**
	 * An `AbortSignal` provided by an `AbortController`. This allows the network
	 * request to be cancelled if necessary.
	 *
	 * @deprecated Move the `signal` parameter into `fetchOptions.signal`:
	 *
	 * @see \<https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal\>
	 */
	signal?: AbortSignalLike
}

/**
 * Configuration for clients that determine how content is queried.
 */
export type ClientConfig = {
	/**
	 * The full Rest API V2 endpoint for the repository. This is only helpful if
	 * you're using Prismic behind a proxy which we do not recommend.
	 *
	 * @defaultValue `getRepositoryEndpoint(repositoryNameOrEndpoint)`
	 */
	documentAPIEndpoint?: string

	/**
	 * The secure token for accessing the Prismic repository. This is only
	 * required if the repository is set to private.
	 */
	accessToken?: string

	/**
	 * A string representing a version of the Prismic repository's content. This
	 * may point to the latest version (called the "master ref"), or a preview
	 * with draft content.
	 */
	ref?: string | GetRef

	/**
	 * A list of route resolver objects that define how a document's `url`
	 * property is resolved.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	routes?: NonNullable<BuildQueryURLArgs["routes"]>

	/**
	 * The `brokenRoute` option allows you to define the route populated in the
	 * `url` property for broken link or content relationship fields. A broken
	 * link is a link or content relationship field whose linked document has been
	 * unpublished or deleted.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	brokenRoute?: NonNullable<BuildQueryURLArgs["brokenRoute"]>

	/**
	 * Default parameters that will be sent with each query. These parameters can
	 * be overridden on each query if needed.
	 */
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes" | "brokenRoute"
	>

	/**
	 * The function used to make network requests to the Prismic REST API. In
	 * environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetch?: FetchLike

	/**
	 * Options provided to the client's `fetch()` on all network requests. These
	 * options will be merged with internally required options. They can also be
	 * overriden on a per-query basis using the query's `fetchOptions` parameter.
	 */
	fetchOptions?: RequestInitLike
}

/**
 * Parameters specific to client methods that fetch all documents. These methods
 * start with `getAll` (for example, `getAllByType`).
 */
type GetAllParams = {
	/**
	 * Limit the number of documents queried. If a number is not provided, there
	 * will be no limit and all matching documents will be returned.
	 */
	limit?: number
}

/**
 * Arguments to determine how the URL for a preview session is resolved.
 */
type ResolvePreviewArgs<LinkResolverReturnType> = {
	/**
	 * A function that maps a Prismic document to a URL within your app.
	 */
	linkResolver?: LinkResolverFunction<LinkResolverReturnType>

	/**
	 * A fallback URL if the link resolver does not return a value.
	 */
	defaultURL: string

	/**
	 * The preview token (also known as a ref) that will be used to query preview
	 * content from the Prismic repository.
	 */
	previewToken?: string

	/**
	 * The previewed document that will be used to determine the destination URL.
	 */
	documentID?: string
}

/**
 * A client that allows querying content from a Prismic repository.
 *
 * If used in an environment where a global `fetch` function is unavailable,
 * such as Node.js, the `fetch` option must be provided as part of the `options`
 * parameter.
 *
 * @typeParam TDocuments - Document types that are registered for the Prismic
 *   repository. Query methods will automatically be typed based on this type.
 */
export class Client<TDocuments extends PrismicDocument = PrismicDocument> {
	/**
	 * The function used to make network requests to the Prismic REST API. In
	 * environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetchFn: FetchLike

	fetchOptions: RequestInitLike

	#repositoryName: string | undefined

	/**
	 * The Prismic repository's name.
	 */
	set repositoryName(value: string) {
		this.#repositoryName = value
	}

	/**
	 * The Prismic repository's name.
	 */
	get repositoryName(): string {
		if (!this.#repositoryName) {
			throw new PrismicError(
				`A repository name is required for this method but one could not be inferred from the provided API endpoint (\`${this.documentAPIEndpoint}\`). To fix this error, provide a repository name when creating the client. For more details, see ${devMsg("prefer-repository-name")}`,
				undefined,
				undefined,
			)
		}

		return this.#repositoryName
	}

	/**
	 * The Prismic REST API V2 endpoint for the repository (use
	 * `prismic.getRepositoryEndpoint` for the default endpoint).
	 */
	documentAPIEndpoint: string

	/**
	 * The Prismic REST API V2 endpoint for the repository (use
	 * `prismic.getRepositoryEndpoint` for the default endpoint).
	 *
	 * @deprecated Use `documentAPIEndpoint` instead.
	 */
	// TODO: Remove in v8.
	set endpoint(value: string) {
		this.documentAPIEndpoint = value
	}

	/**
	 * The Prismic REST API V2 endpoint for the repository (use
	 * `prismic.getRepositoryEndpoint` for the default endpoint).
	 *
	 * @deprecated Use `documentAPIEndpoint` instead.
	 */
	// TODO: Remove in v8.
	get endpoint(): string {
		return this.documentAPIEndpoint
	}

	/**
	 * The secure token for accessing the API (only needed if your repository is
	 * set to private).
	 *
	 * {@link https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token}
	 */
	accessToken?: string

	/**
	 * A list of route resolver objects that define how a document's `url` field
	 * is resolved.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	routes?: NonNullable<BuildQueryURLArgs["routes"]>

	/**
	 * The `brokenRoute` option allows you to define the route populated in the
	 * `url` property for broken link or content relationship fields. A broken
	 * link is a link or content relationship field whose linked document has been
	 * unpublished or deleted.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	brokenRoute?: NonNullable<BuildQueryURLArgs["brokenRoute"]>

	/**
	 * Default parameters that will be sent with each query. These parameters can
	 * be overridden on each query if needed.
	 */
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>

	#getRef?: GetRef
	#autoPreviews = true
	#autoPreviewsRequest?: HttpRequestLike

	#cachedRepository: Repository | undefined
	#cachedRepositoryExpiration = 0

	/**
	 * Creates a Prismic client that can be used to query a repository.
	 *
	 * If used in an environment where a global `fetch` function is unavailable,
	 * such as in some Node.js versions, the `fetch` option must be provided as
	 * part of the `options` parameter.
	 *
	 * @param repositoryNameOrEndpoint - The Prismic repository name or full Rest
	 *   API V2 endpoint for the repository.
	 * @param options - Configuration that determines how content will be queried
	 *   from the Prismic repository.
	 *
	 * @returns A client that can query content from the repository.
	 */
	constructor(repositoryNameOrEndpoint: string, options: ClientConfig = {}) {
		const {
			documentAPIEndpoint,
			accessToken,
			ref,
			routes,
			brokenRoute,
			defaultParams,
			fetchOptions = {},
			fetch = globalThis.fetch?.bind(globalThis),
		} = options

		if (isRepositoryEndpoint(repositoryNameOrEndpoint)) {
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

		if (!fetch) {
			throw new PrismicError(
				"A valid fetch implementation was not provided. In environments where fetch is not available, a fetch implementation must be provided via a polyfill or the `fetch` option.",
				undefined,
				undefined,
			)
		}
		if (typeof fetch !== "function") {
			throw new PrismicError(
				`fetch must be a function, but received: ${typeof fetch}`,
				undefined,
				undefined,
			)
		}

		if (!isRepositoryEndpoint(this.documentAPIEndpoint)) {
			throw new PrismicError(
				`documentAPIEndpoint is not a valid URL: ${documentAPIEndpoint}`,
				undefined,
				undefined,
			)
		}
		if (
			isRepositoryEndpoint(repositoryNameOrEndpoint) &&
			documentAPIEndpoint &&
			repositoryNameOrEndpoint !== documentAPIEndpoint
		) {
			console.warn(
				`[@prismicio/client] Multiple incompatible endpoints were provided. Create the client using a repository name to prevent this error. For more details, see ${devMsg("prefer-repository-name")}`,
			)
		}
		if (
			/\.prismic\.io\/(?!api\/v2\/?)/i.test(this.documentAPIEndpoint) &&
			process.env.NODE_ENV === "development"
		) {
			throw new PrismicError(
				"@prismicio/client only supports Prismic Rest API V2. Please provide only the repository name to the first createClient() parameter or use the getRepositoryEndpoint() helper to generate a valid Rest API V2 endpoint URL.",
				undefined,
				undefined,
			)
		}
		if (
			/(?<!\.cdn)\.prismic\.io$/i.test(
				new URL(this.documentAPIEndpoint).hostname,
			) &&
			process.env.NODE_ENV === "development"
		) {
			console.warn(
				`[@prismicio/client] The client was created with a non-CDN endpoint. Convert it to the CDN endpoint for better performance. For more details, see ${devMsg("endpoint-must-use-cdn")}`,
			)
		}

		this.accessToken = accessToken
		this.routes = routes
		this.brokenRoute = brokenRoute
		this.defaultParams = defaultParams
		this.fetchOptions = fetchOptions
		this.fetchFn = fetch

		this.graphQLFetch = this.graphQLFetch.bind(this)

		if (ref) {
			this.queryContentFromRef(ref)
		}
	}

	/**
	 * Enables the client to automatically query content from a preview session.
	 *
	 * @example
	 *
	 * ```ts
	 * client.enableAutoPreviews()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#enableautopreviews}
	 */
	enableAutoPreviews(): void {
		this.#autoPreviews = true
	}

	/**
	 * Enables the client to automatically query content from a preview session
	 * using an HTTP request object.
	 *
	 * @example
	 *
	 * ```ts
	 * client.enableAutoPreviewsFromReq(req)
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#enableautopreviewsfromreq}
	 */
	enableAutoPreviewsFromReq(request: HttpRequestLike): void {
		this.enableAutoPreviews()
		this.#autoPreviewsRequest = request
	}

	/**
	 * Disables the client from automatically querying content from a preview
	 * session.
	 *
	 * @example
	 *
	 * ```ts
	 * client.disableAutoPreviews()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#disableautopreviews}
	 */
	disableAutoPreviews(): void {
		this.#autoPreviews = false
		this.#autoPreviewsRequest = undefined
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

		if (results[0]) {
			return results[0]
		}

		throw new NotFoundError(
			"No documents were returned",
			response.url,
			undefined,
		)
	}

	/**
	 * Fetches all pages based on the `params` argument. This method may make
	 * multiple network requests to fetch all matching pages.
	 *
	 * @example
	 *
	 * ```ts
	 * const pages = await client.dangerouslyGetAll()
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#dangerouslygetall}
	 */
	async dangerouslyGetAll<TDocument extends TDocuments>(
		params: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams = {},
	): Promise<TDocument[]> {
		const { limit = Infinity, ...actualParams } = params
		const resolvedParams = {
			...actualParams,
			pageSize: Math.min(
				limit,
				actualParams.pageSize || this.defaultParams?.pageSize || MAX_PAGE_SIZE,
			),
		}

		const documents: TDocument[] = []
		let latestResult: Query<TDocument> | undefined

		while (
			(!latestResult || latestResult.next_page) &&
			documents.length < limit
		) {
			const page = latestResult ? latestResult.page + 1 : undefined

			latestResult = await this.get<TDocument>({ ...resolvedParams, page })
			documents.push(...latestResult.results)

			if (latestResult.next_page) {
				await new Promise((res) => setTimeout(res, GET_ALL_QUERY_DELAY))
			}
		}

		return documents.slice(0, limit)
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
		return await this.getFirst<TDocument>(
			appendFilters(params, filter.at("document.id", id)),
		)
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
		return await this.get<TDocument>(
			appendFilters(params, filter.in("document.id", ids)),
		)
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
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
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
		documentType: TDocumentType,
		uid: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return await this.getFirst<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, [
				typeFilter(documentType),
				filter.at(`my.${documentType}.uid`, uid),
			]),
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
		documentType: TDocumentType,
		uids: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return await this.get<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, [
				typeFilter(documentType),
				filter.in(`my.${documentType}.uid`, uids),
			]),
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
		documentType: TDocumentType,
		uids: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return await this.dangerouslyGetAll<
			ExtractDocumentType<TDocument, TDocumentType>
		>(
			appendFilters(params, [
				typeFilter(documentType),
				filter.in(`my.${documentType}.uid`, uids),
			]),
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
		documentType: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return await this.getFirst<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, typeFilter(documentType)),
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
		documentType: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return await this.get<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, typeFilter(documentType)),
		)
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
		documentType: TDocumentType,
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return await this.dangerouslyGetAll<
			ExtractDocumentType<TDocument, TDocumentType>
		>(appendFilters(params, typeFilter(documentType)))
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
		return await this.get<TDocument>(appendFilters(params, someTagsFilter(tag)))
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
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
			appendFilters(params, someTagsFilter(tag)),
		)
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
		return await this.get<TDocument>(
			appendFilters(params, everyTagFilter(tags)),
		)
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
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
			appendFilters(params, everyTagFilter(tags)),
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
		return await this.get<TDocument>(
			appendFilters(params, someTagsFilter(tags)),
		)
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
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
			appendFilters(params, someTagsFilter(tags)),
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
		if (
			this.#cachedRepository &&
			this.#cachedRepositoryExpiration > Date.now()
		) {
			return this.#cachedRepository
		}

		const url = new URL(this.documentAPIEndpoint)

		const accessToken = params?.accessToken || this.accessToken
		if (accessToken) {
			url.searchParams.set("access_token", accessToken)
		}

		const response = await this.#request(url, params)

		if (response.ok) {
			this.#cachedRepository = (await response.json()) as Repository
			this.#cachedRepositoryExpiration = Date.now() + REPOSITORY_CACHE_TTL

			return this.#cachedRepository
		}

		if (response.status === 404) {
			throw new RepositoryNotFoundError(
				`Prismic repository not found. Check that "${this.documentAPIEndpoint}" is pointing to the correct repository.`,
				url.toString(),
				undefined,
			)
		}

		return await this.#throwContentAPIError(response, url.toString())
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
	async getRefs(params?: FetchParams): Promise<Ref[]> {
		const repository = await this.getRepository(params)

		return repository.refs
	}

	/**
	 * Fetches a ref by its ID.
	 *
	 * @example
	 *
	 * ```ts
	 * const ref = await client.getRefByID("YhE3YhEAACIA4321")
	 * ```
	 *
	 * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrefbyid}
	 */
	async getRefByID(id: string, params?: FetchParams): Promise<Ref> {
		const refs = await this.getRefs(params)

		return findRefByID(refs, id)
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
	async getRefByLabel(label: string, params?: FetchParams): Promise<Ref> {
		const refs = await this.getRefs(params)

		return findRefByLabel(refs, label)
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
	async getMasterRef(params?: FetchParams): Promise<Ref> {
		const refs = await this.getRefs(params)

		return findMasterRef(refs)
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
	async getReleases(params?: FetchParams): Promise<Ref[]> {
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
	async getReleaseByID(id: string, params?: FetchParams): Promise<Ref> {
		const releases = await this.getReleases(params)

		return findRefByID(releases, id)
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
	async getReleaseByLabel(label: string, params?: FetchParams): Promise<Ref> {
		const releases = await this.getReleases(params)

		return findRefByLabel(releases, label)
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
	async getTags(params?: FetchParams): Promise<string[]> {
		const repository = await this.getRepository(params)
		const form = repository.forms.tags
		if (form) {
			const url = new URL(form.action)
			if (this.accessToken) {
				url.searchParams.set("access_token", this.accessToken)
			}

			const response = await this.#request(url, params)
			if (response.ok) {
				return (await response.json()) as string[]
			}
		}

		return repository.tags
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
	async buildQueryURL({
		signal,
		fetchOptions,
		...params
	}: Partial<BuildQueryURLArgs> & FetchParams = {}): Promise<string> {
		const ref =
			params.ref ||
			(await this.#getResolvedRef({
				accessToken: params.accessToken,
				signal,
				fetchOptions,
			}))
		const integrationFieldsRef =
			params.integrationFieldsRef ||
			(
				await this.getRepository({
					accessToken: params.accessToken,
					signal,
					fetchOptions,
				})
			).integrationFieldsRef ||
			undefined

		return buildQueryURL(this.documentAPIEndpoint, {
			...this.defaultParams,
			...params,
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
	async resolvePreviewURL<LinkResolverReturnType>(
		args: ResolvePreviewArgs<LinkResolverReturnType> & FetchParams,
	): Promise<string> {
		let documentID: string | undefined | null = args.documentID
		let previewToken: string | undefined | null = args.previewToken

		if (typeof globalThis.location !== "undefined") {
			const searchParams = new URLSearchParams(globalThis.location.search)

			documentID = documentID || searchParams.get("documentId")
			previewToken = previewToken || searchParams.get("token")
		} else if (this.#autoPreviewsRequest) {
			if ("query" in this.#autoPreviewsRequest) {
				documentID =
					documentID || (this.#autoPreviewsRequest.query?.documentId as string)
				previewToken =
					previewToken || (this.#autoPreviewsRequest.query?.token as string)
			} else if (
				"url" in this.#autoPreviewsRequest &&
				this.#autoPreviewsRequest.url
			) {
				// Including "missing-host://" by default
				// handles a case where Next.js Route Handlers
				// only provide the pathname and search
				// parameters in the `url` property
				// (e.g. `/api/preview?foo=bar`).
				const searchParams = new URL(
					this.#autoPreviewsRequest.url,
					"missing-host://",
				).searchParams

				documentID = documentID || searchParams.get("documentId")
				previewToken = previewToken || searchParams.get("token")
			}
		}

		if (documentID != null && previewToken != null) {
			const document = await this.getByID(documentID, {
				ref: previewToken,
				lang: "*",
				signal: args.signal,
				fetchOptions: args.fetchOptions,
			})

			const url = asLink(document, { linkResolver: args.linkResolver })

			if (typeof url === "string") {
				return url
			}
		}

		return args.defaultURL
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
		init?: Omit<RequestInit, "signal"> & { signal?: AbortSignalLike },
	): Promise<Response> {
		const repository = await this.getRepository()
		const ref = await this.#getResolvedRef()

		const unsanitizedHeaders: Record<string, string> = {
			"Prismic-ref": ref,
			Authorization: this.accessToken ? `Token ${this.accessToken}` : "",
			// Asserting `init.headers` is a Record since popular GraphQL
			// libraries pass this as a Record. Header objects as input
			// are unsupported.
			...(init ? (init.headers as Record<string, string>) : {}),
		}

		if (repository.integrationFieldsRef) {
			unsanitizedHeaders["Prismic-integration-field-ref"] =
				repository.integrationFieldsRef
		}

		// Normalize header keys to lowercase. This prevents header
		// conflicts between the Prismic client and the GraphQL
		// client.
		const headers: Record<string, string> = {}
		for (const key in unsanitizedHeaders) {
			if (unsanitizedHeaders[key]) {
				headers[key.toLowerCase()] =
					unsanitizedHeaders[key as keyof typeof unsanitizedHeaders]
			}
		}

		const url = new URL(
			// Asserting `input` is a string since popular GraphQL
			// libraries pass this as a string. Request objects as
			// input are unsupported.
			input as string,
		)

		// This prevents the request from being cached unnecessarily.
		// Without adding this `ref` param, re-running a query
		// could return a locally cached response, even if the
		// `ref` changed. This happens because the URL is
		// identical when the `ref` is not included. Caches may ignore
		// headers.
		//
		// The Prismic GraphQL API ignores the `ref` param.
		url.searchParams.set("ref", ref)

		const query = url.searchParams.get("query")
		if (query) {
			url.searchParams.set(
				"query",
				// Compress the GraphQL query (if it exists) by
				// removing whitespace. This is done to
				// optimize the query size and avoid
				// hitting the upper limit of GET requests
				// (2048 characters).
				minifyGraphQLQuery(query),
			)
		}

		return (await this.fetchFn(url.toString(), {
			...init,
			headers,
		})) as Response
	}

	/**
	 * Returns the ref needed to query based on the client's current state. This
	 * method may make a network request to fetch a ref or resolve the user's ref
	 * thunk.
	 *
	 * If auto previews are enabled, the preview ref takes priority if available.
	 *
	 * The following strategies are used depending on the client's state:
	 *
	 * - If the user called `queryLatestContent`: Use the repository's master ref.
	 *   The ref is cached for 5 seconds. After 5 seconds, a new master ref is
	 *   fetched.
	 * - If the user called `queryContentFromReleaseByID`: Use the release's ref.
	 *   The ref is cached for 5 seconds. After 5 seconds, a new ref for the
	 *   release is fetched.
	 * - If the user called `queryContentFromReleaseByLabel`: Use the release's ref.
	 *   The ref is cached for 5 seconds. After 5 seconds, a new ref for the
	 *   release is fetched.
	 * - If the user called `queryContentFromRef`: Use the provided ref. Fall back
	 *   to the master ref if the ref is not a string.
	 *
	 * @returns The ref to use during a query.
	 */
	async #getResolvedRef(
		params?: Pick<BuildQueryURLArgs, "accessToken"> & FetchParams,
	) {
		if (this.#autoPreviews) {
			const cookies = this.#autoPreviewsRequest?.headers
				? "get" in this.#autoPreviewsRequest.headers
					? this.#autoPreviewsRequest.headers.get("cookie")
					: this.#autoPreviewsRequest.headers.cookie
				: globalThis.document?.cookie
			const previewRef = getPreviewCookie(cookies ?? "")
			if (previewRef) {
				return previewRef
			}
		}

		const ref = await this.#getRef?.(params)
		if (ref) {
			return ref
		}

		const masterRef = await this.getMasterRef(params)
		return masterRef.ref
	}

	async #internalGet(
		params?: Partial<BuildQueryURLArgs> & FetchParams,
		attempt = 1,
	): Promise<ResponseLike> {
		const url = await this.buildQueryURL(params)
		const response = await this.#request(new URL(url), params)

		if (response.ok) {
			return response
		}

		try {
			return await this.#throwContentAPIError(response, url)
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
				if (!masterRef) {
					throw error
				}

				const badRef = new URL(url).searchParams.get("ref")
				const issue = error instanceof RefNotFoundError ? "invalid" : "expired"
				throttledLog(
					`[@prismicio/client] The ref (${badRef}) was ${issue}. Now retrying with the latest master ref (${masterRef}). If you were previewing content, the response will not include draft content.`,
					{ level: "warn" },
				)

				return await this.#internalGet(
					{ ...params, ref: masterRef },
					attempt + 1,
				)
			}

			throw error
		}
	}

	async #throwContentAPIError(
		response: ResponseLike,
		url: string,
	): Promise<never> {
		switch (response.status) {
			case 400: {
				const json = await response.clone().json()
				throw new ParsingError(json.message, url, json)
			}
			case 401: {
				const json = await response.clone().json()
				throw new ForbiddenError(json.message, url, json)
			}
			case 404: {
				const json = await response.clone().json()
				switch (json.type) {
					case "api_notfound_error": {
						throw new RefNotFoundError(json.message, url, json)
					}
					case "api_security_error": {
						if (/preview token.*expired/i.test(json.message)) {
							throw new PreviewTokenExpiredError(json.message, url, json)
						}
					}
					default: {
						throw new NotFoundError(json.message, url, json)
					}
				}
			}
			case 410: {
				const json = await response.clone().json()
				throw new RefExpiredError(json.message, url, json)
			}
			default: {
				throw new PrismicError(undefined, url, await response.text())
			}
		}
	}

	/**
	 * Makes an HTTP request using the client's configured fetch function and
	 * options.
	 *
	 * @param url - The URL to request.
	 * @param params - Fetch options.
	 *
	 * @returns The response from the fetch request.
	 */
	async #request(url: URL, params?: FetchParams): Promise<ResponseLike> {
		return await request(
			url,
			{
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
			},
			this.fetchFn,
		)
	}
}
