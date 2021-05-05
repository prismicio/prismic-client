import { appendPredicates } from './lib/appendPredicates'
import { getCookie } from './lib/getCookie'
import { orElseThrow } from './lib/orElseThrow'

import { Document, Query, Ref, Repository } from './types'
import { buildQueryURL, BuildQueryURLArgs } from './buildQueryURL'
import * as cookie from './cookie'
import * as predicate from './predicate'

interface HttpRequest {
  headers: {
    cookie: string | null | undefined
  }
}

type RefStringOrFn = string | (() => string | undefined)

type Fetch = typeof fetch

type ClientConfig = {
  accessToken?: string
  ref?: RefStringOrFn
  fetch?: Fetch
} & Omit<BuildQueryURLArgs, 'ref'>

type GetAllParams = {
  limit?: number
}

const MAX_PAGE_SIZE = 100

const typePredicate = (documentType: string): string =>
  predicate.at('document.type', documentType)

const tagsPredicate = (tags: string | string[]): string =>
  predicate.at('document.tags', tags)

const firstResult = <TDocument extends Document>(
  queryResponse: Query<TDocument>,
): TDocument => queryResponse.results[0]

const findRef = (refs: Ref[], predicate: (ref: Ref) => boolean): Ref => {
  const ref = refs.find((ref) => predicate(ref))

  if (!ref) {
    throw new Error('Ref could not be found.')
  }

  return ref
}

export const createClient = (
  ...args: ConstructorParameters<typeof Client>
): Client => new Client(...args)

export class Client {
  endpoint: string
  accessToken?: string
  ref?: RefStringOrFn
  fetchFn: Fetch
  httpRequest?: HttpRequest
  params?: Omit<BuildQueryURLArgs, 'ref'>
  private autoPreviewsEnabled: boolean

  constructor(endpoint: string, options: ClientConfig = {}) {
    const { ref, accessToken, ...params } = options

    this.endpoint = endpoint
    this.accessToken = accessToken
    this.ref = ref
    this.params = params
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

  enableAutoPreviews(): void {
    this.autoPreviewsEnabled = true
  }

  enableAutoPreviewsFromReq<R extends HttpRequest>(req: R): void {
    this.httpRequest = req
    this.autoPreviewsEnabled = true
  }

  disableAutoPreviews(): void {
    this.autoPreviewsEnabled = false
  }

  query = this.get

  async get<TDocument extends Document>(
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    const url = await this.buildQueryURL(params)

    return await this.fetch<Query<TDocument>>(url)
  }

  async getAll<TDocument extends Document>(
    params: Partial<BuildQueryURLArgs> & GetAllParams = {},
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

  async getById<TDocument extends Document>(
    id: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    const result = await this.get<TDocument>(
      appendPredicates(predicate.at('document.id', id))(params),
    )

    return orElseThrow(
      firstResult(result),
      new Error(`A document with ID "${id}" could not be found.`),
    )
  }

  async getByUID<TDocument extends Document>(
    documentType: string,
    uid: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    const result = await this.get<TDocument>(
      appendPredicates(
        typePredicate(documentType),
        predicate.at('document.uid', uid),
      )(params),
    )

    return orElseThrow(
      firstResult(result),
      new Error(
        `A document of type "${documentType}" with UID "${uid}" could not be found.`,
      ),
    )
  }

  async getSingle<TDocument extends Document>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    const result = await this.get<TDocument>(
      appendPredicates(typePredicate(documentType))(params),
    )

    return orElseThrow(
      firstResult(result),
      new Error(`A document of type "${documentType}" could not be found.`),
    )
  }

  async getByType<TDocument extends Document>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    return await this.get<TDocument>(
      appendPredicates(typePredicate(documentType))(params),
    )
  }

  async getAllByType<TDocument extends Document>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument[]> {
    return await this.getAll<TDocument>(
      appendPredicates(typePredicate(documentType))(params),
    )
  }

  getByTags = this.getByTag
  async getByTag<TDocument extends Document>(
    tags: string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>>
  async getByTag<TDocument extends Document>(
    tags: string | string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    return await this.get<TDocument>(
      appendPredicates(tagsPredicate(tags))(params),
    )
  }

  getAllByTags = this.getAllByTag
  async getAllByTag<TDocument extends Document>(
    tag: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument[]>
  async getAllByTag<TDocument extends Document>(
    tags: string | string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument[]> {
    return await this.getAll<TDocument>(
      appendPredicates(tagsPredicate(tags))(params),
    )
  }

  async getRefs(): Promise<Ref[]> {
    const res = await this.fetch<Repository>(this.endpoint)

    return res.refs
  }

  async getRefById(id: string): Promise<Ref> {
    const refs = await this.getRefs()

    return findRef(refs, (ref) => ref.id === id)
  }

  async getRefByLabel(label: string): Promise<Ref> {
    const refs = await this.getRefs()

    return findRef(refs, (ref) => ref.label === label)
  }

  async getMasterRef(): Promise<Ref> {
    const refs = await this.getRefs()

    return findRef(refs, (ref) => ref.isMasterRef)
  }

  async buildQueryURL(
    params: Partial<BuildQueryURLArgs> = {},
  ): Promise<string> {
    const ref = params.ref || (await this.getResolvedRefString())

    return buildQueryURL(this.endpoint, {
      ...this.params,
      ...params,
      ref,
    })
  }

  private getPreviewRefString(): string | undefined {
    if (typeof globalThis.document !== 'undefined') {
      return getCookie(cookie.preview, globalThis.document.cookie)
    } else if (this.httpRequest?.headers.cookie) {
      return getCookie(cookie.preview, this.httpRequest.headers.cookie)
    }
  }

  private async getResolvedRefString(): Promise<string> {
    if (this.autoPreviewsEnabled) {
      const previewRef = this.getPreviewRefString()

      if (previewRef) {
        return previewRef
      }
    }

    const thisRefIdOrFn = this.ref

    if (typeof thisRefIdOrFn === 'function') {
      const res = thisRefIdOrFn()

      if (typeof res === 'string') {
        return res
      }
    } else if (thisRefIdOrFn) {
      return thisRefIdOrFn
    }

    const masterRef = await this.getMasterRef()

    return masterRef.ref
  }

  private buildRequestOptions(): RequestInit {
    return this.accessToken
      ? { headers: { Authorization: `Token ${this.accessToken}` } }
      : {}
  }

  private async fetch<T = unknown>(
    uri: string,
    options?: RequestInit,
  ): Promise<T> {
    const baseOptions = this.buildRequestOptions()
    const res = await this.fetchFn(uri, { ...baseOptions, ...options })

    if (res.status === 200) {
      // We can assume Prismic REST API responses will have a `application/json`
      // Content Type.
      return await res.json()
    } else if (res.status === 401) {
      throw new Error(
        '401 Unauthorized: A valid access token is required to access this repository.',
      )
    } else {
      throw new Error(`${res.status}: An unknown network error occured.`)
    }
  }
}
