import * as prismicT from '@prismicio/types'

import { appendPredicates } from './lib/appendPredicates'
import { getCookie } from './lib/getCookie'

import {
  FetchLike,
  HttpRequestLike,
  LinkResolver,
  Query,
  Ref,
  Repository,
  RequestInitLike,
} from './types'
import { buildQueryURL, BuildQueryURLArgs } from './buildQueryURL'
import { HTTPError } from './HTTPError'
import * as cookie from './cookie'
import * as predicate from './predicate'

/**
 * A ref or a function that returns a ref. If a static ref is known, one can be given. If the ref must be fetched on-demand, a function can be provided. This function can optionally be asynchronous.
 */
type RefStringOrFn =
  | string
  | (() => string | undefined | Promise<string | undefined>)

/**
 * Configuration for clients that determine how content is queried.
 */
export type ClientConfig = {
  /**
   * The secure token for accessing the Prismic repository. This is only required if the repository is set to private.
   */
  accessToken?: string

  /**
   * A string representing a version of the Prismic repository's content. This may point to the latest version (called the "master ref"), or a preview with draft content.
   */
  ref?: RefStringOrFn

  /**
   * Default parameters that will be sent with each query. These parameters can be overridden on each query if needed.
   */
  defaultParams?: Omit<BuildQueryURLArgs, 'ref' | 'accessToken'>

  /**
   * The function used to make network requests to the Prismic REST API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
   */
  fetch?: FetchLike
}

/**
 * Parameters specific to client methods that fetch all documents. These methods start with `getAll` (for example, `getAllByType`).
 */
type GetAllParams = {
  /**
   * Limit the number of documents queried. If a number is not provided, there will be no limit and all matching documents will be returned.
   */
  limit?: number
}

/**
 * Arguments to determine how the URL for a preview session is resolved.
 */
type ResolvePreviewArgs = {
  /**
   * A function that maps a Prismic document to a URL within your app.
   */
  linkResolver: LinkResolver

  /**
   * A fallback URL if the Link Resolver does not return a value.
   */
  defaultUrl: string

  /**
   * The preview token (also known as a ref) that will be used to query preview content from the Prismic repository.
   */
  previewToken?: string

  /**
   * The previewed document that will be used to determine the destination URL.
   */
  documentId?: string
}

/**
 * The largest page size allowed by the Prismic REST API V2. This value is used to minimize the number of requests required to query content.
 */
const MAX_PAGE_SIZE = 100

/**
 * Creates a predicate to filter content by document type.
 *
 * @param documentType The document type to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
const typePredicate = (documentType: string): string =>
  predicate.at('document.type', documentType)

/**
 * Creates a predicate to filter content by document tags.
 *
 * @param documentType Document tags to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
const tagsPredicate = (tags: string | string[]): string =>
  predicate.at('document.tags', tags)

/**
 * Returns the first ref from a list that passes a predicate (a function that returns true).
 *
 * @throws If a matching ref cannot be found.
 *
 * @param refs A list of refs to search.
 * @param predicate A function that determines if a ref from the list matches the criteria.
 *
 * @returns The first matching ref.
 */
const findRef = (refs: Ref[], predicate: (ref: Ref) => boolean): Ref => {
  const ref = refs.find((ref) => predicate(ref))

  if (!ref) {
    throw new Error('Ref could not be found.')
  }

  return ref
}

/**
 * Creates a Prismic client that can be used to query a repository.
 *
 * @param endpoint The Prismic REST API V2 endpoint for the repository (use `prismic.getEndpoint` for the default endpoint).
 * @param options Configuration that determines how content will be queried from the Prismic repository.
 *
 * @returns A client that can query content from the repository.
 */
export const createClient = (
  ...args: ConstructorParameters<typeof Client>
): Client => new Client(...args)

/**
 * A client that allows querying content from a Prismic repository.
 *
 * If used in an environment where a global `fetch` function is unavailable, such as Node.js, the `fetch` option must be provided as part of the `options` parameter.
 */
export class Client {
  /**
   * The Prismic REST API V2 endpoint for the repository (use `prismic.getEndpoint` for the default endpoint).
   */
  endpoint: string

  /**
   * The secure token for accessing the API (only needed if your repository is set to private).
   *
   * {@link https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token}
   */
  accessToken?: string

  /**
   * Ref used to query documents.
   *
   * {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api#prismic-api-ref}
   */
  ref?: RefStringOrFn

  /**
   * The function used to make network requests to the Prismic REST API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
   */
  fetchFn: FetchLike

  /**
   * An HTTP server request object containing the request's cookies. In a server environment, the request is used to support automatic Prismic preview support when querying draft content.
   */
  httpRequest?: HttpRequestLike

  /**
   * Default parameters that will be sent with each query. These parameters can be overridden on each query if needed.
   */
  defaultParams?: Omit<BuildQueryURLArgs, 'ref'>

  /**
   * Determines if queries will automatically point to a preview ref if available.
   */
  private autoPreviewsEnabled: boolean

  /**
   * Creates a Prismic client that can be used to query a repository.
   *
   * If used in an environment where a global `fetch` function is unavailable, such as Node.js, the `fetch` option must be provided as part of the `options` parameter.
   *
   * @param endpoint The Prismic REST API V2 endpoint for the repository (use `prismic.getEndpoint` to get the default endpoint).
   * @param options Configuration that determines how content will be queried from the Prismic repository.
   *
   * @returns A client that can query content from the repository.
   */
  constructor(endpoint: string, options: ClientConfig = {}) {
    this.endpoint = endpoint
    this.accessToken = options.accessToken
    this.ref = options.ref
    this.defaultParams = options.defaultParams
    this.autoPreviewsEnabled = true

    if (options.fetch) {
      this.fetchFn = options.fetch
    } else if (typeof globalThis.fetch === 'function') {
      this.fetchFn = globalThis.fetch
    } else {
      throw new Error(
        'A fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option.',
      )
    }
  }

  /**
   * Enables the client to automatically query content from a preview session if one is active in browser environments. This is enabled by default in the browser.
   *
   * For server environments, use `enableAutoPreviewsFromReq`.
   *
   * @see enableAutoPreviewsFromReq
   *
   * @example
   * ```ts
   * client.enableAutoPreviews()
   * ```
   */
  enableAutoPreviews(): void {
    this.autoPreviewsEnabled = true
  }

  /**
   * Enables the client to automatically query content from a preview session if one is active in server environments. This is disabled by default on the server.
   *
   * For browser environments, use `enableAutoPreviews`.
   *
   * @param req An HTTP server request object containing the request's cookies.
   *
   * @example
   * ```ts
   * // In an express app
   * app.get('/', function (req, res) {
   *   client.enableAutoPreviewsFromReq(req)
   * })
   * ```
   */
  enableAutoPreviewsFromReq<R extends HttpRequestLike>(req: R): void {
    this.httpRequest = req
    this.autoPreviewsEnabled = true
  }

  /**
   * Disables the client from automatically querying content from a preview session if one is active.
   *
   * Automatic preview content querying is enabled by default unless this method is called.
   *
   * @example
   * ```ts
   * client.disableAutoPreviews()
   * ```
   */
  disableAutoPreviews(): void {
    this.autoPreviewsEnabled = false
  }

  query = this.get

  /**
   * Queries content from the Prismic repository.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param params Parameters to filter, sort, and paginate results.
   *
   * @returns A paginated response containing the result of the query.
   *
   * ```ts
   * const response = await client.get()
   * ```
   */
  async get<TDocument extends prismicT.PrismicDocument>(
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    const url = await this.buildQueryURL(params)

    return await this.fetch<Query<TDocument>>(url, params)
  }

  /**
   * Queries content from the Prismic repository and returns only the first result, if any.
   *
   * @typeParam TDocument Type of the Prismic document returned.
   * @param params Parameters to filter, sort, and paginate results.
   *
   * @returns The first result of the query, if any.
   *
   * @example
   * ```ts
   * const document = await client.getFirst()
   * ```
   */
  async getFirst<TDocument extends prismicT.PrismicDocument>(
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    const result = await this.get<TDocument>(params)
    const firstResult = result.results[0]

    if (firstResult) {
      return firstResult
    }

    throw new Error('No documents were returned')
  }

  /**
   * Queries content from the Prismic repository and returns all matching content. If no predicates are provided, all documents will be fetched.
   *
   * This method may make multiple network requests to query all matching content.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param params Parameters to filter, sort, and paginate results.
   *
   * @returns A list of documents matching the query.
   *
   * @example
   * ```ts
   * const response = await client.getAll()
   * ```
   */
  async getAll<TDocument extends prismicT.PrismicDocument>(
    params: Partial<Omit<BuildQueryURLArgs, 'page'>> & GetAllParams = {},
  ): Promise<TDocument[]> {
    const { limit = Infinity, ...actualParams } = params
    const resolvedParams = { pageSize: MAX_PAGE_SIZE, ...actualParams }

    const result = await this.get<TDocument>(resolvedParams)

    let page = result.page
    let documents = result.results

    while (page < result.total_pages && documents.length < limit) {
      page += 1
      const result = await this.get<TDocument>({ ...resolvedParams, page })
      documents = [...documents, ...result.results]
    }

    return documents.slice(0, limit)
  }

  /**
   * Queries a document from the Prismic repository with a specific ID.
   *
   * @remarks
   *
   * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
   *
   * @typeParam TDocument Type of the Prismic document returned.
   * @param id ID of the document.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns The document with an ID matching the `id` parameter, if a matching document exists.
   *
   * @example
   * ```ts
   * const document = await client.getByID('WW4bKScAAMAqmluX')
   * ```
   */
  async getByID<TDocument extends prismicT.PrismicDocument>(
    id: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    return await this.getFirst<TDocument>(
      appendPredicates(predicate.at('document.id', id))(params),
    )
  }

  /**
   * Queries documents from the Prismic repository with specific IDs.
   *
   * @remarks
   *
   * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param ids A list of document IDs.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A paginated response containing documents with IDs matching the `ids` parameter.
   *
   * @example
   * ```ts
   * const response = await client.getByIDs(['WW4bKScAAMAqmluX', 'U1kTRgEAAC8A5ldS'])
   * ```
   */
  async getByIDs<TDocument extends prismicT.PrismicDocument>(
    ids: string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    return await this.get<TDocument>(
      appendPredicates(predicate.at('document.id', ids))(params),
    )
  }

  /**
   * Queries all documents from the Prismic repository with specific IDs.
   *
   * This method may make multiple network requests to query all matching content.
   *
   * @remarks
   *
   * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param ids A list of document IDs.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A list of documents with IDs matching the `ids` parameter, if a matching document exists.
   *
   * @example
   * ```ts
   * const response = await client.getAllByIDs(['WW4bKScAAMAqmluX', 'U1kTRgEAAC8A5ldS'])
   * ```
   */
  async getAllByIDs<TDocument extends prismicT.PrismicDocument>(
    ids: string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument[]> {
    return await this.getAll<TDocument>(
      appendPredicates(predicate.at('document.id', ids))(params),
    )
  }

  /**
   * Queries a document from the Prismic repository with a specific UID and Custom Type.
   *
   * @remarks
   *
   * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
   *
   * @typeParam TDocument Type of the Prismic document returned.
   * @param documentType The API ID of the document's Custom Type.
   * @param uid UID of the document.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns The document with a UID matching the `uid` parameter, if a matching document exists.
   *
   * @example
   * ```ts
   * const document = await client.getByUID('blog_post', 'my-first-post')
   * ```
   */
  async getByUID<TDocument extends prismicT.PrismicDocument>(
    documentType: string,
    uid: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    return await this.getFirst<TDocument>(
      appendPredicates(
        typePredicate(documentType),
        predicate.at(`my.${documentType}.uid`, uid),
      )(params),
    )
  }

  /**
   * Queries a singleton document from the Prismic repository for a specific Custom Type.
   *
   * @remarks
   *
   * A singleton document is one that is configured in Prismic to only allow one instance. For example, a repository may be configured to contain just one Settings document. This is in contrast to a repeatable Custom Type which allows multiple instances of itself.
   *
   * @typeParam TDocument Type of the Prismic document returned.
   * @param documentType The API ID of the singleton Custom Type.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns The singleton document for the Custom Type, if a matching document exists.
   *
   * @example
   * ```ts
   * const document = await client.getSingle('settings')
   * ```
   */
  async getSingle<TDocument extends prismicT.PrismicDocument>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    return await this.getFirst<TDocument>(
      appendPredicates(typePredicate(documentType))(params),
    )
  }

  /**
   * Queries documents from the Prismic repository for a specific Custom Type.
   *
   * Use `getAllByType` instead if you need to query all documents for a specific Custom Type.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param documentType The API ID of the Custom Type.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A paginated response containing documents of the Custom Type.
   *
   * @example
   * ```ts
   * const response = await client.getByType('blog_post')
   * ```
   */
  async getByType<TDocument extends prismicT.PrismicDocument>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    return await this.get<TDocument>(
      appendPredicates(typePredicate(documentType))(params),
    )
  }

  /**
   * Queries all documents from the Prismic repository for a specific Custom Type.
   *
   * This method may make multiple network requests to query all matching content.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param documentType The API ID of the Custom Type.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A list of all documents of the Custom Type.
   *
   * @example
   * ```ts
   * const response = await client.getByType('blog_post')
   * ```
   */
  async getAllByType<TDocument extends prismicT.PrismicDocument>(
    documentType: string,
    params?: Partial<Omit<BuildQueryURLArgs, 'page'>>,
  ): Promise<TDocument[]> {
    return await this.getAll<TDocument>(
      appendPredicates(typePredicate(documentType))(params),
    )
  }

  /**
   * Queries documents from the Prismic repository with a specific tag.
   *
   * Use `getAllByTag` instead if you need to query all documents with a specific tag.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param tag The tag that must be included on a document.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A paginated response containing documents with the tag.
   *
   * @example
   * ```ts
   * const response = await client.getByTag('food')
   * ```
   */
  async getByTag<TDocument extends prismicT.PrismicDocument>(
    tag: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    return await this.get<TDocument>(
      appendPredicates(tagsPredicate(tag))(params),
    )
  }

  /**
   * Queries all documents from the Prismic repository with a specific tag.
   *
   * This method may make multiple network requests to query all matching content.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param tag The tag that must be included on a document.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A list of all documents with the tag.
   *
   * @example
   * ```ts
   * const response = await client.getAllByTag('food')
   * ```
   */
  async getAllByTag<TDocument extends prismicT.PrismicDocument>(
    tag: string,
    params?: Partial<Omit<BuildQueryURLArgs, 'page'>>,
  ): Promise<TDocument[]> {
    return await this.getAll<TDocument>(
      appendPredicates(tagsPredicate(tag))(params),
    )
  }

  /**
   * Queries documents from the Prismic repository with a specific tag.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param tags A list of tags that must be included on a document.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A paginated response containing documents with the tag.
   *
   * @example
   * ```ts
   * const response = await client.getAllByTag('food')
   * ```
   */
  async getByTags<TDocument extends prismicT.PrismicDocument>(
    tags: string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    return await this.get<TDocument>(
      appendPredicates(tagsPredicate(tags))(params),
    )
  }

  /**
   * Queries all documents from the Prismic repository with a specific tag.
   *
   * This method may make multiple network requests to query all matching content.
   *
   * @typeParam TDocument Type of Prismic documents returned.
   * @param tags A list of tags that must be included on a document.
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A list of all documents with the tag.
   *
   * @example
   * ```ts
   * const response = await client.getAllByTag('food')
   * ```
   */
  async getAllByTags<TDocument extends prismicT.PrismicDocument>(
    tags: string[],
    params?: Partial<Omit<BuildQueryURLArgs, 'page'>>,
  ): Promise<TDocument[]> {
    return await this.getAll<TDocument>(
      appendPredicates(tagsPredicate(tags))(params),
    )
  }

  /**
   * Returns a list of all refs for the Prismic repository.
   *
   * Refs are used to identify which version of the repository's content should be queried. All repositories will have at least one ref pointing to the latest published content called the "master ref".
   *
   * @returns A list of all refs for the Prismic repository.
   */
  async getRefs(): Promise<Ref[]> {
    const res = await this.fetch<Repository>(this.endpoint)

    return res.refs
  }

  /**
   * Returns a ref for the Prismic repository with a matching ID.
   *
   * @param id ID of the ref.
   *
   * @returns The ref with a matching ID, if it exists.
   */
  async getRefById(id: string): Promise<Ref> {
    const refs = await this.getRefs()

    return findRef(refs, (ref) => ref.id === id)
  }

  /**
   * Returns a ref for the Prismic repository with a matching label.
   *
   * @param label Label of the ref.
   *
   * @returns The ref with a matching label, if it exists.
   */
  async getRefByLabel(label: string): Promise<Ref> {
    const refs = await this.getRefs()

    return findRef(refs, (ref) => ref.label === label)
  }

  /**
   * Returns the master ref for the Prismic repository. The master ref points to the repository's latest published content.
   *
   * @returns The repository's master ref.
   */
  async getMasterRef(): Promise<Ref> {
    const refs = await this.getRefs()

    return findRef(refs, (ref) => ref.isMasterRef)
  }

  /**
   * Returns a list of all tags used in the Prismic repository.
   *
   * @returns A list of all tags used in the repository.
   */
  async getTags(): Promise<string[]> {
    const res = await this.fetch<Repository>(this.endpoint)

    return res.tags
  }

  /**
   * Builds a URL used to query content from the Prismic repository.
   *
   * @param params Parameters to filter, sort, and paginate the results.
   *
   * @returns A URL string that can be requested to query content.
   */
  async buildQueryURL(
    params: Partial<BuildQueryURLArgs> = {},
  ): Promise<string> {
    const {
      ref = await this.getResolvedRefString(),
      accessToken: _accessToken,
      ...actualParams
    } = params

    return buildQueryURL(this.endpoint, {
      ...this.defaultParams,
      ...actualParams,
      ref,
    })
  }

  /**
   * Determines the URL for a previewed document during an active preview session. The result of this method should be used to redirect the user to the document's URL.
   *
   * @param args Arguments to configure the URL resolving.
   *
   * @returns The URL for the previewed document during an active preview session. The user should be redirected to this URL.
   *
   * @example
   * ```ts
   * const url = resolvePreviewUrl({
   *   linkResolver: (document) => `/${document.uid}`
   *   defaultUrl: '/'
   * })
   * ```
   */
  async resolvePreviewUrl(args: ResolvePreviewArgs): Promise<string> {
    let documentId = args.documentId
    let previewToken = args.previewToken

    if (typeof globalThis.location !== 'undefined') {
      const searchParams = new URLSearchParams(globalThis.location.search)
      documentId = documentId || searchParams.get('documentId') || undefined
      previewToken = previewToken || searchParams.get('token') || undefined
    } else if (this.httpRequest?.query) {
      if (typeof this.httpRequest.query.documentId === 'string') {
        documentId = documentId || this.httpRequest.query.documentId
      }
      if (typeof this.httpRequest.query.token === 'string') {
        previewToken = previewToken || this.httpRequest.query.token
      }
    }

    if (documentId != null) {
      const document = await this.getByID(documentId, {
        ref: previewToken,
      })

      return args.linkResolver(document)
    } else {
      return args.defaultUrl
    }
  }

  /**
   * Returns the preview ref for the client, if one exists.
   *
   * If this method is used in the browser, the browser's cookies will be read. If this method is used on the server, the cookies from the saved HTTP Request will be read, if an HTTP Request was given.
   *
   * @returns The preview ref as a string, if one exists.
   */
  private getPreviewRefString(): string | undefined {
    if (globalThis.document?.cookie) {
      return getCookie(cookie.preview, globalThis.document.cookie)
    } else if (this.httpRequest?.headers?.cookie) {
      return getCookie(cookie.preview, this.httpRequest.headers.cookie)
    }
  }

  /**
   * Returns the ref needed to query based on the client's current state. This method may make a network request to resolve the users's ref getter function or fetch the repository's master ref.
   *
   * The following flow is used:
   *
   * 1. If previews are enabled, it will return the preview ref if one is available.
   *
   * 2. If a ref or a function that returns a ref is given at client instantiation via the `ref` configuration option, it will be returned. If a function is provided, it will be resolved before returning.
   *
   * 3. If any of the above methods return a falsy value, the master ref will be used.
   */
  private async getResolvedRefString(): Promise<string> {
    if (this.autoPreviewsEnabled) {
      const previewRef = this.getPreviewRefString()

      if (previewRef) {
        return previewRef
      }
    }

    const thisRefStringOrFn = this.ref

    if (typeof thisRefStringOrFn === 'function') {
      const res = await thisRefStringOrFn()

      if (typeof res === 'string') {
        return res
      }
    } else if (thisRefStringOrFn) {
      return thisRefStringOrFn
    }

    const masterRef = await this.getMasterRef()

    return masterRef.ref
  }

  /**
   * Returns the network request options required by the Prismic repository.
   *
   * It currently only includes an Authorization header if an access token is provided.
   *
   * @param params Parameters for the query, including an access token.
   *
   * @returns Request options that can be used to make a network request to query the repository.
   */
  private buildRequestOptions(
    params?: Partial<BuildQueryURLArgs>,
  ): RequestInitLike {
    const accessToken = params?.accessToken || this.accessToken

    return accessToken
      ? { headers: { Authorization: `Token ${accessToken}` } }
      : {}
  }

  /**
   * Performs a network request using the configured `fetch` function. It assumes all successful responses will have a JSON content type. It also normalizes unsuccessful network requests.
   *
   * @typeParam T The JSON response.
   * @param url URL to the resource to fetch.
   * @param params Prismic REST API parameters for the network request.
   *
   * @returns The JSON response from the network request.
   */
  private async fetch<T = unknown>(
    url: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<T> {
    const options = this.buildRequestOptions(params)
    const rawRes = await this.fetchFn(url, options)

    // We clone to response to avoid reading an already used Response object.
    // This could happen if the user implements their own caching solution.
    const res = rawRes.clone()

    if (res.status === 200) {
      // We can assume Prismic REST API responses will have a `application/json`
      // Content Type.
      return await res.json()
    } else if (rawRes.status === 401) {
      throw new HTTPError('Invalid access token', rawRes, url, options)
    } else {
      throw new HTTPError(undefined, rawRes, url, options)
    }
  }
}
