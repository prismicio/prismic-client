import { type LimitFunction, pLimit } from "./lib/pLimit"

import { PrismicError } from "./errors/PrismicError"

/**
 * The default delay used with APIs not providing rate limit headers.
 *
 * @internal
 */
export const UNKNOWN_RATE_LIMIT_DELAY = 1500

/**
 * A universal API to make network requests. A subset of the `fetch()` API.
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/fetch}
 */
export type FetchLike = (
	input: string,
	init?: RequestInitLike,
) => Promise<ResponseLike>

/**
 * An object that allows you to abort a `fetch()` request if needed via an
 * `AbortController` object
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal}
 */
// `any` is used often here to ensure this type is universally valid among
// different AbortSignal implementations. The types of each property are not
// important to validate since it is blindly passed to a given `fetch()`
// function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbortSignalLike = any

/**
 * A subset of RequestInit properties to configure a `fetch()` request.
 */
// Only options relevant to the client are included. Extending from the full
// RequestInit would cause issues, such as accepting Header objects.
//
// An interface is used to allow other libraries to augment the type with
// environment-specific types.
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
	// NOTE: `AbortSignalLike` is `any`! It is left as `AbortSignalLike`
	// for backwards compatibility (the type is exported) and to signal to
	// other readers that this should be an AbortSignal-like object.
	signal?: AbortSignalLike
}

/**
 * The minimum required properties from Response.
 */
export interface ResponseLike {
	ok: boolean
	status: number
	headers: HeadersLike
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any>
	text(): Promise<string>
	blob(): Promise<Blob>
}

/**
 * The minimum required properties from Headers.
 */
export interface HeadersLike {
	get(name: string): string | null
}

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
 * Configuration for clients that determine how APIs are queried.
 */
export type BaseClientConfig = {
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
 * The result of a `fetch()` job.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FetchJobResult<TJSON = any> = {
	status: number
	headers: HeadersLike
	json: TJSON
	text?: string
}

export abstract class BaseClient {
	/**
	 * The function used to make network requests to the Prismic REST API. In
	 * environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetchFn: FetchLike

	fetchOptions?: RequestInitLike

	/**
	 * Active queued `fetch()` jobs keyed by URL and AbortSignal (if it exists).
	 */
	private queuedFetchJobs: Record<string, LimitFunction> = {}

	/**
	 * Active deduped `fetch()` jobs keyed by URL and AbortSignal (if it exists).
	 */
	private dedupedFetchJobs: Record<
		string,
		Map<AbortSignalLike | undefined, Promise<FetchJobResult>>
	> = {}

	constructor(options: BaseClientConfig) {
		this.fetchOptions = options.fetchOptions

		if (typeof options.fetch === "function") {
			this.fetchFn = options.fetch
		} else if (typeof globalThis.fetch === "function") {
			this.fetchFn = globalThis.fetch as FetchLike
		} else {
			throw new PrismicError(
				"A valid fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option.",
				undefined,
				undefined,
			)
		}

		// If the global fetch function is used, we must bind it to the global scope.
		if (this.fetchFn === globalThis.fetch) {
			this.fetchFn = this.fetchFn.bind(globalThis)
		}
	}

	protected async fetch(
		url: string,
		params: FetchParams = {},
	): Promise<FetchJobResult> {
		const requestInit: RequestInitLike = {
			...this.fetchOptions,
			...params.fetchOptions,
			headers: {
				...this.fetchOptions?.headers,
				...params.fetchOptions?.headers,
			},
			signal:
				params.fetchOptions?.signal ||
				params.signal ||
				this.fetchOptions?.signal,
		}

		// Request with a `body` are throttled, others are deduped.
		if (params.fetchOptions?.body) {
			return this.queueFetch(url, requestInit)
		} else {
			return this.dedupeFetch(url, requestInit)
		}
	}

	private queueFetch(
		url: string,
		requestInit: RequestInitLike = {},
	): Promise<FetchJobResult> {
		// Rate limiting is done per hostname.
		const hostname = new URL(url).hostname

		if (!this.queuedFetchJobs[hostname]) {
			this.queuedFetchJobs[hostname] = pLimit({
				interval: UNKNOWN_RATE_LIMIT_DELAY,
			})
		}

		return this.queuedFetchJobs[hostname](() =>
			this.createFetchJob(url, requestInit),
		)
	}

	private dedupeFetch(
		url: string,
		requestInit: RequestInitLike = {},
	): Promise<FetchJobResult> {
		let job: Promise<FetchJobResult>

		// `fetchJobs` is keyed twice: first by the URL and again by is
		// signal, if one exists.
		//
		// Using two keys allows us to reuse fetch requests for
		// equivalent URLs, but eject when we detect unique signals.
		if (
			this.dedupedFetchJobs[url] &&
			this.dedupedFetchJobs[url].has(requestInit.signal)
		) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			job = this.dedupedFetchJobs[url].get(requestInit.signal)!
		} else {
			this.dedupedFetchJobs[url] = this.dedupedFetchJobs[url] || new Map()

			job = this.createFetchJob(url, requestInit).finally(() => {
				this.dedupedFetchJobs[url]?.delete(requestInit.signal)

				if (this.dedupedFetchJobs[url]?.size === 0) {
					delete this.dedupedFetchJobs[url]
				}
			})

			this.dedupedFetchJobs[url].set(requestInit.signal, job)
		}

		return job
	}

	private createFetchJob(
		url: string,
		requestInit: RequestInitLike = {},
	): Promise<FetchJobResult> {
		return this.fetchFn(url, requestInit).then(async (res) => {
			// We can assume Prismic REST API responses
			// will have a `application/json`
			// Content Type. If not, this will
			// throw, signaling an invalid
			// response.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let json: any = undefined
			let text: string | undefined = undefined
			if (res.ok) {
				try {
					json = await res.json()
				} catch {
					// noop
				}
			} else {
				try {
					text = await res.text()
					json = JSON.parse(text)
				} catch {
					// noop
				}
			}

			return {
				status: res.status,
				headers: res.headers,
				json,
				text,
			}
		})
	}
}
