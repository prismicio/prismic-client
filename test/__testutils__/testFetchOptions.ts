import { expect, it, vi } from "vitest"

import type { RequestInit } from "node-fetch"
import fetch from "node-fetch"

import { createTestClient } from "./createClient"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import type * as prismic from "../../src"
import {
	PRISMIC_CLIENT_VERSION_HEADER,
	PRISMIC_DEV_HEADER,
} from "../../src/createClient"

type TestFetchOptionsArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>
}

const cleanupInternalHeaders = (init: RequestInit | undefined) => {
	if (init?.headers) {
		if (PRISMIC_DEV_HEADER in init.headers) {
			delete init.headers[PRISMIC_DEV_HEADER]
		}
		if (PRISMIC_CLIENT_VERSION_HEADER in init.headers) {
			delete init.headers[PRISMIC_CLIENT_VERSION_HEADER]
		}
	}
}

export const testFetchOptions = (
	description: string,
	args: TestFetchOptionsArgs,
): void => {
	it.concurrent(`${description} (on client)`, async (ctx) => {
		const abortController = new AbortController()

		const fetchSpy = vi.fn(fetch)
		const fetchOptions: prismic.RequestInitLike = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		}

		const masterRef = ctx.mock.api.ref({ isMasterRef: true })
		const releaseRef = ctx.mock.api.ref({ isMasterRef: false })
		releaseRef.id = "id" // Referenced in ref-related tests.
		releaseRef.label = "label" // Referenced in ref-related tests.
		const repositoryResponse = ctx.mock.api.repository()
		repositoryResponse.refs = [masterRef, releaseRef]

		mockPrismicRestAPIV2({
			ctx,
			repositoryResponse,
			queryResponse: ctx.mock.api.query({
				documents: [ctx.mock.value.document()],
			}),
		})

		const client = createTestClient({
			clientConfig: {
				fetch: fetchSpy,
				fetchOptions,
			},
		})

		await args.run(client)

		for (const [input, init] of fetchSpy.mock.calls) {
			cleanupInternalHeaders(init)
			expect(init, input.toString()).toStrictEqual(fetchOptions)
		}
	})

	it.concurrent(`${description} (on method)`, async (ctx) => {
		const abortController = new AbortController()

		const fetchSpy = vi.fn(fetch)
		const fetchOptions: prismic.RequestInitLike = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		}

		const masterRef = ctx.mock.api.ref({ isMasterRef: true })
		const releaseRef = ctx.mock.api.ref({ isMasterRef: false })
		releaseRef.id = "id" // Referenced in ref-related tests.
		releaseRef.label = "label" // Referenced in ref-related tests.
		const repositoryResponse = ctx.mock.api.repository()
		repositoryResponse.refs = [masterRef, releaseRef]

		mockPrismicRestAPIV2({
			ctx,
			repositoryResponse,
			queryResponse: ctx.mock.api.query({
				documents: [ctx.mock.value.document()],
			}),
		})

		const client = createTestClient({
			clientConfig: {
				fetch: fetchSpy,
			},
		})

		await args.run(client, { fetchOptions })

		for (const [input, init] of fetchSpy.mock.calls) {
			cleanupInternalHeaders(init)
			expect(init, input.toString()).toStrictEqual(fetchOptions)
		}
	})
}
