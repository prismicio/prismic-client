import type { MockInstance } from "vitest"
import { afterEach, beforeEach, expect, vi } from "vitest"

import { deepEqual } from "node:assert/strict"

import { Client } from "../src"

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {})
	vi.spyOn(console, "warn").mockImplementation(() => {})
})

afterEach(() => {
	vi.resetAllMocks()
})

expect.extend({
	toHaveFetchedContentAPI(client: unknown, requiredSearchParams) {
		if (!isMockedClient(client)) {
			return {
				pass: false,
				message: () =>
					".toHaveFetchedContentAPI() can only be called with a mocked Prismic client.",
			}
		}

		const { isNot } = this

		requiredSearchParams = new URLSearchParams(requiredSearchParams)

		const { calls } = vi.mocked(client.fetchFn).mock

		const pass = calls.some((call) => {
			const url = new URL(call[0])

			const contentAPIEndpoint = ensureTrailingSlash(
				new URL(client.documentAPIEndpoint),
			)
			const isContentAPI =
				url.origin === contentAPIEndpoint.origin &&
				url.pathname === contentAPIEndpoint.pathname + "documents/search"

			return (
				isContentAPI &&
				requiredSearchParams
					.entries()
					.every(([key, value]) => url.searchParams.has(key, value))
			)
		})

		return {
			pass,
			message: () =>
				`Client ${!pass || !isNot ? "did not call" : "called"} the Content API${requiredSearchParams.size > 0 ? ` with the required params` : ""}`,
		}
	},
	toHaveLastFetchedContentAPI(
		client: unknown,
		expectedSearchParams,
		expectedRequestInit = {},
	) {
		if (!isMockedClient(client)) {
			throw new Error(
				".toHaveLastFetchedContentAPI() can only be called with a mocked Prismic client.",
			)
		}

		const { isNot } = this

		const call = vi.mocked(client.fetchFn).mock.lastCall
		if (!call) {
			throw new Error("The client did not make any network requests.")
		}

		expectedSearchParams = new URLSearchParams(expectedSearchParams)

		const actualURLBase = new URL(call[0])
		const actualURL = new URL(actualURLBase.pathname, actualURLBase.origin)
		for (const [key] of expectedSearchParams) {
			for (const value of actualURLBase.searchParams.getAll(key)) {
				actualURL.searchParams.append(key, value)
			}
		}
		const actualRequestInit = call[1] ?? {}
		for (const key in actualRequestInit) {
			if (!(key in expectedRequestInit)) {
				delete actualRequestInit[key as keyof typeof actualRequestInit]
			}
		}
		const actual = new Request(actualURL, actualRequestInit)

		const expectedURL = new URL(
			"documents/search",
			ensureTrailingSlash(client.documentAPIEndpoint),
		)
		expectedSearchParams.forEach((value, key) =>
			expectedURL.searchParams.append(key, value),
		)
		const expected = new Request(expectedURL, expectedRequestInit)

		const pass = isDeepEqual(actual, expected)

		return {
			pass,
			message: () =>
				`The client ${!pass || !isNot ? "did not last call" : "last called"} the Content API${expectedSearchParams.size > 0 || Object.keys(expectedRequestInit).length > 0 ? ` with the expected parameters` : ""}`,
			actual: JSON.stringify(requestToObject(actual), null, 2),
			expected: JSON.stringify(requestToObject(expected), null, 2),
		}
	},
	toHaveFetchedContentAPITimes(client: unknown, expected) {
		if (!isMockedClient(client)) {
			return {
				pass: false,
				message: () =>
					".toHaveFetchedContentAPITimes() can only be called with a mocked Prismic client.",
			}
		}

		const calls = vi.mocked(client.fetchFn).mock.calls.filter(([url]) => {
			return new URL(url).pathname.endsWith("/documents/search")
		})

		const actual = calls.length

		return {
			pass: actual === expected,
			message: () =>
				`Client fetched Content API ${expected} time${expected === 1 ? "" : "s"}.`,
			actual,
			expected,
		}
	},
	toHaveFetchedRepoTimes(client: unknown, expected) {
		if (!isMockedClient(client)) {
			return {
				pass: false,
				message: () =>
					".toHaveFetchedRepoMetadataTimes() can only be called with a mocked Prismic client.",
			}
		}

		const calls = vi.mocked(client.fetchFn).mock.calls.filter(([url]) => {
			const actual = new URL(url).pathname
			const expected = new URL(client.documentAPIEndpoint).pathname

			return actual === expected
		})

		const actual = calls.length

		return {
			pass: actual === expected,
			message: () =>
				`Client fetched repo ${expected} time${expected === 1 ? "" : "s"}.`,
			actual,
			expected,
		}
	},
	toHaveSearchParam(url: unknown, key, expectedValue) {
		try {
			url = new URL(url as string)
		} catch {
			return {
				pass: false,
				message: () => ".toNotHaveSearchParam() can only be called on URLs.",
			}
		}

		const { isNot } = this

		let pass = (url as URL).searchParams.has(key)
		if (typeof expectedValue === "string") {
			pass &&= (url as URL).searchParams.get(key) === expectedValue
		}

		const actual = (url as URL).searchParams
		const expected = new URLSearchParams((url as URL).searchParams)
		if (isNot) {
			expected.delete(key)
		} else {
			expected.set(key, expectedValue ?? "")
		}

		return {
			pass,
			message: () =>
				`URL ${!pass || isNot ? "does not have" : "has"} search param "${key}"`,
			actual: `?${actual}`,
			expected: `?${expected}`,
		}
	},
})

function isMockedClient(
	input: unknown,
): input is Client & { fetchFn: MockInstance } {
	return input instanceof Client && vi.isMockFunction(input.fetchFn)
}

function ensureTrailingSlash(url: string): string
function ensureTrailingSlash(url: URL): URL
function ensureTrailingSlash(url: string | URL) {
	const newURL = new URL(url)

	if (!newURL.pathname.endsWith("/")) {
		newURL.pathname += "/"
	}

	return typeof url === "string" ? newURL.toString() : newURL
}

function requestToObject(request: Request) {
	return {
		url: request.url,
		method: request.method,
		cache: request.cache,
		headers: Object.fromEntries(Array.from(request.headers.entries()).sort()),
		signal: {
			aborted: request.signal.aborted,
		},
		body: request.body ? request.body.toString() : null,
	}
}

function isDeepEqual<T>(actual: unknown, expected: T): expected is T {
	try {
		deepEqual(actual, expected)

		return true
	} catch {
		return false
	}
}
