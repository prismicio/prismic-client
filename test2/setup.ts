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
	toHaveFetchedContentAPI(client: unknown, expectedParams, expectedInit = {}) {
		assertMockedClient(client)

		expectedParams = new URLSearchParams(expectedParams)

		const pass = vi.mocked(client.fetchFn).mock.calls.some(([url, init]) => {
			const actual = new Request(
				filterURLParams(url, Array.from(expectedParams.keys())),
				filterRequestInit(init, Object.keys(expectedInit)),
			)
			const expected = new Request(
				getContentAPIURL(client, expectedParams),
				expectedInit,
			)

			return isDeepEqual(actual, expected)
		})

		return {
			pass,
			message: () =>
				`Client ${!pass || !this.isNot ? "did not call" : "called"} the Content API${expectedParams.size > 0 ? ` with the required params` : ""}`,
		}
	},
	toHaveLastFetchedContentAPI(
		client: unknown,
		expectedParams,
		expectedInit = {},
	) {
		assertMockedClient(client)
		assertHasBeenCalled(client.fetchFn)

		expectedParams = new URLSearchParams(expectedParams)
		const [url, init] = client.fetchFn.mock.lastCall

		const actual = new Request(
			filterURLParams(url, Array.from(expectedParams.keys())),
			filterRequestInit(init, Object.keys(expectedInit)),
		)
		const expected = new Request(
			getContentAPIURL(client, expectedParams),
			expectedInit,
		)
		const pass = isDeepEqual(actual, expected)

		return {
			pass,
			message: () =>
				`The client ${!pass || !this.isNot ? "did not last call" : "last called"} the Content API${expectedParams.size > 0 || Object.keys(expectedInit).length > 0 ? ` with the expected parameters` : ""}`,
			actual: stringifyRequest(actual),
			expected: stringifyRequest(expected),
		}
	},
	toHaveFetchedContentAPITimes(client: unknown, expected) {
		assertMockedClient(client)

		const actual = vi
			.mocked(client.fetchFn)
			.mock.calls.filter(([url]) => isContentAPICall(url, client)).length

		return {
			pass: actual === expected,
			message: () =>
				`Client fetched Content API ${actual} time${actual === 1 ? "" : "s"}.`,
			actual,
			expected,
		}
	},
	toHaveFetchedRepo(client: unknown, expectedParams, expectedInit = {}) {
		assertMockedClient(client)

		expectedParams = new URLSearchParams(expectedParams)

		const pass = vi.mocked(client.fetchFn).mock.calls.some(([url, init]) => {
			const actual = new Request(
				filterURLParams(url, Array.from(expectedParams.keys())),
				filterRequestInit(init, Object.keys(expectedInit)),
			)
			const expected = new Request(
				getRepoURL(client, expectedParams),
				expectedInit,
			)

			return isDeepEqual(actual, expected)
		})

		return {
			pass,
			message: () =>
				`Client ${!pass || !this.isNot ? "did not call" : "called"} the repository${expectedParams.size > 0 ? ` with the required params` : ""}`,
		}
	},
	toHaveLastFetchedRepo(client: unknown, expectedParams, expectedInit = {}) {
		assertMockedClient(client)
		assertHasBeenCalled(client.fetchFn)

		expectedParams = new URLSearchParams(expectedParams)
		const [url, init] = client.fetchFn.mock.lastCall

		const actual = new Request(
			filterURLParams(url, Array.from(expectedParams.keys())),
			filterRequestInit(init, Object.keys(expectedInit)),
		)
		const expected = new Request(
			getRepoURL(client, expectedParams),
			expectedInit,
		)
		const pass = isDeepEqual(actual, expected)

		return {
			pass,
			message: () =>
				`The client ${!pass || !this.isNot ? "did not last call" : "last called"} the repository${expectedParams.size > 0 || Object.keys(expectedInit).length > 0 ? ` with the expected parameters` : ""}`,
			actual: stringifyRequest(actual),
			expected: stringifyRequest(expected),
		}
	},
	toHaveFetchedRepoTimes(client: unknown, expected) {
		assertMockedClient(client)

		const actual = vi
			.mocked(client.fetchFn)
			.mock.calls.filter(([url]) => isRepoURL(url, client)).length

		return {
			pass: actual === expected,
			message: () =>
				`Client fetched repo ${actual} time${actual === 1 ? "" : "s"}.`,
			actual,
			expected,
		}
	},
	toHaveSearchParam(received: unknown, key, value) {
		const actual = new URL(String(received)).searchParams
		const expected = new URLSearchParams(actual)
		if (this.isNot) {
			expected.delete(key)
		} else {
			expected.set(key, value ?? "")
		}

		const pass = actual.has(key, value)

		return {
			pass,
			message: () =>
				`URL ${!pass || this.isNot ? "does not have" : "has"} search param "${key}"${typeof value === "string" ? ` with value "${value}"` : ""}`,
			actual: `?${actual}`,
			expected: `?${expected}`,
		}
	},
})

function assertMockedClient(
	input: unknown,
): asserts input is Client & { fetchFn: MockInstance<Client["fetchFn"]> } {
	if (!(input instanceof Client) || !vi.isMockFunction(input.fetchFn)) {
		throw new Error("Not a mocked Prismic client")
	}
}

function assertHasBeenCalled(
	mock: MockInstance,
): asserts mock is typeof mock & {
	mock: { lastCall: NonNullable<typeof mock.mock.lastCall> }
} {
	if (!mock.mock.lastCall) {
		throw new Error("The mock was never called")
	}
}

function isContentAPICall(url: URL | string, client: Client): boolean {
	return hasBaseURL(url, getContentAPIURL(client))
}

function isRepoURL(url: URL | string, client: Client): boolean {
	return hasBaseURL(url, getRepoURL(client))
}

function getContentAPIURL(
	client: Client,
	params?: ConstructorParameters<typeof URLSearchParams>[0],
): URL {
	const url = new URL("documents/search", getRepoURL(client))
	url.search = new URLSearchParams(params).toString()

	return url
}

function getRepoURL(
	client: Client,
	params?: ConstructorParameters<typeof URLSearchParams>[0],
): URL {
	const url = new URL(client.documentAPIEndpoint)
	url.search = new URLSearchParams(params).toString()
	if (!url.pathname.endsWith("/")) {
		url.pathname += "/"
	}

	return url
}

function hasBaseURL(url: string | URL, base: string | URL) {
	url = new URL(url)
	base = new URL(base)

	return url.origin === base.origin && url.pathname === base.pathname
}

function filterURLParams(url: string | URL, keys: string[]) {
	url = new URL(url)

	const res = new URL(url.pathname, url.origin)
	for (const key of new Set(keys)) {
		for (const value of url.searchParams.getAll(key)) {
			res.searchParams.append(key, value)
		}
	}

	return res
}

function filterRequestInit<T extends RequestInit>(
	init: T | undefined,
	keys: (keyof T | (string & {}))[],
) {
	return Object.fromEntries(
		Object.entries(init ?? {}).filter(([key]) => keys.includes(key as keyof T)),
	)
}

function stringifyRequest(request: Request) {
	const obj = {
		url: request.url,
		method: request.method,
		cache: request.cache,
		headers: Object.fromEntries([...request.headers].sort()),
		signal: { aborted: request.signal.aborted },
		body: request.body?.toString(),
	}

	return JSON.stringify(obj, null, 2)
}

function isDeepEqual<T>(actual: unknown, expected: T): expected is T {
	try {
		deepEqual(actual, expected)

		return true
	} catch {
		return false
	}
}
