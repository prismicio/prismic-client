import { castArray } from './lib/castArray'
import { getCookie } from './lib/getCookie'

import { Document, Query, Ref, Repository } from './types'
import { buildQueryURL, BuildQueryURLArgs } from './buildQueryURL'
import * as cookie from './cookie'
import * as predicate from './predicates'

interface HttpRequest {
  headers: {
    cookie: string | null | undefined
  }
}

type RefIdOrFn = string | (() => string | undefined)
type Fetch = typeof fetch

type ClientConfig = {
  accessToken?: string
  ref?: RefIdOrFn
  fetch?: Fetch
} & Omit<BuildQueryURLArgs, 'ref'>

type GetAllParams = {
  limit?: number
}

const MAX_PAGE_SIZE = 100

const concatCastArray = <T>(...elements: (T | T[])[]): T[] =>
  elements.map((element) => castArray(element)).flat()

const appendPredicates = (...predicates: string[]) => (
  params: Partial<BuildQueryURLArgs> = {},
): Partial<BuildQueryURLArgs> => ({
  ...params,
  predicates: concatCastArray(params?.predicates ?? [], ...predicates),
})

const orElseThrow = <T>(a: T | null | undefined, error: Error): T => {
  if (a == null) {
    throw error
  }

  return a
}

export class Client {
  private endpoint: string
  private accessToken?: string
  private ref?: RefIdOrFn
  private fetchFn: Fetch
  private httpRequest?: HttpRequest
  private params?: Omit<BuildQueryURLArgs, 'ref'>
  private internalEnableAutomaticPreviews: boolean

  constructor(endpoint: string, options: ClientConfig = {}) {
    const { ref, accessToken, ...params } = options

    this.endpoint = endpoint
    this.accessToken = accessToken
    this.ref = ref
    this.params = params
    this.internalEnableAutomaticPreviews = true

    if (options.fetch) {
      this.fetchFn = options.fetch
    } else {
      if (typeof fetch === 'undefined') {
        throw new Error(
          'A fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option.',
        )
      } else {
        this.fetchFn = globalThis.fetch
      }
    }
  }

  enableAutomaticPreviews(): void {
    this.internalEnableAutomaticPreviews = true
  }

  enableAutomaticPreviewsFromReq<R extends HttpRequest>(req: R): void {
    this.httpRequest = req
  }

  disableAutomaticPreviews(): void {
    this.internalEnableAutomaticPreviews = false
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

    while (page <= result.total_pages && documents.length < limit) {
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
    const generateParams = appendPredicates(predicate.at('document.id', id))
    const result = await this.get<TDocument>(generateParams(params))

    return orElseThrow(
      result.results[0],
      new Error(`A document with ID "${id}" could not be found.`),
    )
  }

  async getByUID<TDocument extends Document>(
    documentType: string,
    uid: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    const generateParams = appendPredicates(
      predicate.at('document.type', documentType),
      predicate.at('document.uid', uid),
    )
    const result = await this.get<TDocument>(generateParams(params))

    return orElseThrow(
      result.results[0],
      new Error(
        `A document of type "${documentType}" with UID "${uid}" could not be found.`,
      ),
    )
  }

  async getSingle<TDocument extends Document>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument> {
    const generateParams = appendPredicates(
      predicate.at('document.type', documentType),
    )
    const result = await this.get<TDocument>(generateParams(params))

    return orElseThrow(
      result.results[0],
      new Error(`A document of type "${documentType}" could not be found.`),
    )
  }

  async getByType<TDocument extends Document>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    const generateParams = appendPredicates(
      predicate.at('document.type', documentType),
    )

    return await this.get<TDocument>(generateParams(params))
  }

  async getAllByType<TDocument extends Document>(
    documentType: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument[]> {
    const generateParams = appendPredicates(
      predicate.at('document.type', documentType),
    )

    return await this.getAll<TDocument>(generateParams(params))
  }

  async getByTag<TDocument extends Document>(
    tag: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    const generateParams = appendPredicates(predicate.at('document.tags', tag))

    return await this.get<TDocument>(generateParams(params))
  }

  async getAllByTag<TDocument extends Document>(
    tag: string,
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument[]> {
    const generateParams = appendPredicates(predicate.at('document.tags', tag))

    return await this.getAll<TDocument>(generateParams(params))
  }

  async getByTags<TDocument extends Document>(
    tags: string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<Query<TDocument>> {
    const generateParams = appendPredicates(predicate.at('document.tags', tags))

    return await this.get<TDocument>(generateParams(params))
  }

  async getAllByTags<TDocument extends Document>(
    tags: string[],
    params?: Partial<BuildQueryURLArgs>,
  ): Promise<TDocument[]> {
    const generateParams = appendPredicates(predicate.at('document.tags', tags))

    return await this.getAll<TDocument>(generateParams(params))
  }

  async buildQueryURL(params?: Partial<BuildQueryURLArgs>): Promise<string> {
    const ref = params?.ref ?? (await this.getResolvedRefString())

    return buildQueryURL(this.endpoint, {
      ...this.params,
      ...params,
      ref,
    })
  }

  async getRefs(): Promise<Ref[]> {
    const res = await this.fetch<Repository>(this.endpoint)

    return res.refs
  }

  private async getMasterRef(): Promise<Ref> {
    const refs = await this.getRefs()
    const masterRef = refs.find((ref) => ref.isMasterRef)

    if (!masterRef) {
      throw new Error('Master ref could not be found.')
    }

    return masterRef
  }

  private getPreviewRefString(): string | undefined {
    if (typeof globalThis.document !== 'undefined') {
      return getCookie(cookie.preview, globalThis.document.cookie)
    } else if (this.httpRequest?.headers.cookie) {
      return getCookie(cookie.preview, this.httpRequest.headers.cookie)
    }
  }

  private async getResolvedRefString(): Promise<string> {
    if (this.internalEnableAutomaticPreviews) {
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
    } else if (typeof thisRefIdOrFn === 'string') {
      return thisRefIdOrFn
    }

    const masterRef = await this.getMasterRef()

    return masterRef.ref
  }

  private buildRequestOptions(): RequestInit {
    const headers = new Headers()

    if (this.accessToken) {
      headers.set('Authorization', `Token ${this.accessToken}`)
    }

    return { headers }
  }

  private async fetch<T = unknown>(
    uri: string,
    options?: RequestInit,
  ): Promise<T> {
    const baseOptions = this.buildRequestOptions()
    const res = await this.fetchFn(uri, { ...baseOptions, ...options })

    if (res.ok) {
      // We can assume Prismic REST API responses will have a `application/json`
      // Content Type.
      return await res.json()
    } else {
      switch (res.status) {
        case 401: {
          throw new Error(
            '401 Unauthorized: A valid access token is required to access this repository.',
          )
        }

        default: {
          throw new Error(`${res.status}: An unknown network error occured.`)
        }
      }
    }
  }
}
