import { type LimitFunction, pLimit } from "./pLimit"

/**
 * The default number of milliseconds to wait before retrying a rate-limited
 * `fetch()` request (429 response code). The default value is only used if the
 * response does not include a `retry-after` header.
 */
export const DEFAULT_RETRY_AFTER = 1500 // ms

/**
 * A record of URLs mapped to throttled task runners.
 */
const THROTTLED_RUNNERS: Partial<Record<string, LimitFunction>> = {}

/**
 * A record of URLs mapped to active deduplicated jobs. Jobs are keyed by their
 * optional signal.
 */
const DEDUPLICATED_JOBS: Partial<
	Record<string, Map<AbortSignalLike | undefined, Promise<ResponseLike>>>
> = {}

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
	clone(): ResponseLike
}

/**
 * The minimum required properties from Headers.
 */
export interface HeadersLike {
	get(name: string): string | null
}

/**
 * Makes an HTTP request with automatic retry for rate limits and request
 * deduplication.
 *
 * @param url - The URL to request.
 * @param init - Fetch options.
 * @param fetchFn - The fetch function to use.
 *
 * @returns The response from the fetch request.
 */
export async function request(
	url: URL,
	init: RequestInitLike | undefined,
	fetchFn: FetchLike,
): Promise<ResponseLike> {
	const stringURL = url.toString()

	let job: Promise<ResponseLike>

	// Throttle requests with a body.
	if (init?.body) {
		// Rate limiting is done per hostname.
		const runner = (THROTTLED_RUNNERS[url.hostname] ||= pLimit({
			interval: DEFAULT_RETRY_AFTER,
		}))

		job = runner(() => fetchFn(stringURL, init))
	} else {
		// Deduplicate all other requests.
		const existingJob = DEDUPLICATED_JOBS[stringURL]?.get(init?.signal)
		if (existingJob) {
			job = existingJob
		} else {
			job = fetchFn(stringURL, init).finally(() => {
				DEDUPLICATED_JOBS[stringURL]?.delete(init?.signal)
				if (DEDUPLICATED_JOBS[stringURL]?.size === 0) {
					delete DEDUPLICATED_JOBS[stringURL]
				}
			})
			const map = (DEDUPLICATED_JOBS[stringURL] ||= new Map())
			map.set(init?.signal, job)
		}
	}

	const response = await job

	// Retry rate limited requests.
	if (response.status === 429) {
		const retryAfter = Number(response.headers.get("retry-after"))
		const resolvedRetryAfter = Number.isNaN(retryAfter)
			? DEFAULT_RETRY_AFTER
			: retryAfter * 1000

		await new Promise((resolve) => setTimeout(resolve, resolvedRetryAfter))

		return request(url, init, fetchFn)
	}

	return response.clone()
}
