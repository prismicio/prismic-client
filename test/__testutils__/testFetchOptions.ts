import { expect, it, vi } from "vitest"

import fetch from "node-fetch"

import { createTestClient } from "./createClient"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import type * as prismic from "../../src"

type TestFetchOptionsArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>
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
			ctx,
		})

		await args.run(client)

		for (const [input, init] of fetchSpy.mock.calls) {
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
			ctx,
		})

		await args.run(client, { fetchOptions })

		for (const [input, init] of fetchSpy.mock.calls) {
			expect(init, input.toString()).toStrictEqual(fetchOptions)
		}
	})
}
