import {
	ContentAPIError,
	ForbiddenError,
	NotFoundError,
	ParsingError,
	PreviewTokenExpiredError,
	RefExpiredError,
	RefNotFoundError,
} from "./errors"

import type { BuildQueryURLArgs, Route } from "./buildQueryURL"

export type ClientConfig = {
	accessToken?: string
	routes?: Route[]
	brokenRoute?: Route
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>
	fetchOptions?: RequestInitLike
	fetch?: FetchLike
}

/**
 * A universal API to make network requests. A subset of the `fetch()` API.
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/fetch}
 */
export type FetchLike = (
	input: string,
	init?: RequestInitLike,
) => Promise<ResponseLike>

export interface RequestInitLike extends Pick<RequestInit, "cache"> {
	/**
	 * The HTTP method to use for the request.
	 */
	method?: string

	/**
	 * The request body to send with the request.
	 */
	// We want to keep the body type as compatible as possible, so
	// we only declare the type we need and accept anything else.
	// oxlint-disable-next-line no-explicit-any
	body?: any | FormData | string

	/**
	 * An object literal to set the `fetch()` request's headers.
	 */
	headers?: Record<string, string>

	/**
	 * An AbortSignal to set the `fetch()` request's signal.
	 *
	 * See:
	 * [https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
	 */
	// `any` is used to ensure this type is universally valid among
	// different AbortSignal implementations. The types of each property are not
	// important to validate since it is blindly passed to a given `fetch()`
	// function.
	// oxlint-disable-next-line no-explicit-any
	signal?: any
}

export interface ResponseLike {
	ok: boolean
	status: number
	headers: HeadersLike
	url: string
	// oxlint-disable-next-line no-explicit-any
	json(): Promise<any>
	text(): Promise<string>
	blob(): Promise<Blob>
	clone(): ResponseLike
}

/**
 * The minimum required properties from Headers.
 */
export interface HeadersLike {
	get(name: string): string | null
}

export class Client {
	repositoryName: string
	accessToken?: string
	routes?: Route[]
	brokenRoute?: Route
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>
	fetchOptions: RequestInitLike
	fetch: FetchLike

	constructor(repositoryName: string, config: ClientConfig) {
		const {
			accessToken,
			routes,
			brokenRoute,
			defaultParams,
			fetchOptions = {},
			fetch = globalThis.fetch,
		} = config

		this.repositoryName = repositoryName
		this.accessToken = accessToken
		this.routes = routes
		this.brokenRoute = brokenRoute
		this.defaultParams = defaultParams
		this.fetchOptions = fetchOptions
		this.fetch = fetch
	}

	private async handleContentAPIError(response: ResponseLike) {
		switch (response.status) {
			case 400: {
				const json = await response.json()
				throw new ParsingError(json.message, { response })
			}
			case 401: {
				const json = await response.json()
				throw new ForbiddenError(json.message, { response })
			}
			case 404: {
				const json = await response.json()
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
				const json = await response.json()
				throw new RefExpiredError(json.message, { response })
			}
			default: {
				throw new ContentAPIError("An unknown Content API error occured.", {
					response,
				})
			}
		}
	}
}
