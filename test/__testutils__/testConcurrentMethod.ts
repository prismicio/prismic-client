import { expect, it, vi } from "vitest"

import { rest } from "msw"
import fetch from "node-fetch"

import { createTestClient } from "./createClient"
import { createPagedQueryResponses } from "./createPagedQueryResponses"
import { createRepositoryName } from "./createRepositoryName"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import type * as prismic from "../../src"

type TestConcurrentMethodArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>
	mode:
		| "get"
		| "getAll"
		| "repository"
		| "tags"
		| "resolvePreview"
		| "NOT-SHARED___graphQL"
}

export const testConcurrentMethod = (
	description: string,
	args: TestConcurrentMethodArgs,
): void => {
	it.concurrent(description, async (ctx) => {
		const fetchSpy = vi.fn(fetch)
		const controller1 = new AbortController()
		const controller2 = new AbortController()

		const masterRef = ctx.mock.api.ref({ isMasterRef: true })
		const releaseRef = ctx.mock.api.ref({ isMasterRef: false })
		releaseRef.id = "id" // Referenced in ref-related tests.
		releaseRef.label = "label" // Referenced in ref-related tests.
		const repositoryResponse = ctx.mock.api.repository()
		repositoryResponse.refs = [masterRef, releaseRef]

		const queryResponse = createPagedQueryResponses({ ctx })

		mockPrismicRestAPIV2({
			ctx,
			repositoryResponse,
			queryResponse,
			// A small delay is needed to simulate a real network
			// request. Without the delay, network requests would
			// not be shared.
			queryDelay: 10,
		})

		const client = createTestClient({ clientConfig: { fetch: fetchSpy }, ctx })

		const graphqlURL = `https://${createRepositoryName(ctx)}.cdn.prismic.io/graphql`
		const graphqlResponse = { foo: "bar" }
		ctx.server.use(
			rest.get(graphqlURL, (req, res, ctx) => {
				if (req.headers.get("Prismic-Ref") === masterRef.ref) {
					return res(ctx.json(graphqlResponse))
				}
			}),
		)

		await Promise.all([
			// Shared
			args.run(client),
			args.run(client),

			// Shared
			args.run(client, { signal: controller1.signal }),
			args.run(client, { signal: controller1.signal }),

			// Shared
			args.run(client, { signal: controller2.signal }),
			args.run(client, { signal: controller2.signal }),
		])

		// Not shared
		await args.run(client)
		await args.run(client)

		// `get` methods use a total of 6 requests:
		// - 1x /api/v2 (shared across all requests)
		// - 5x /api/v2/documents/search

		// `getAll` methods use a total of 11 requests:
		// - 1x /api/v2 (shared across all requests)
		// - 10x /api/v2/documents/search

		switch (args.mode) {
			case "get": {
				expect(fetchSpy.mock.calls.length).toBe(8)

				break
			}

			case "getAll": {
				expect(fetchSpy.mock.calls.length).toBe(13)

				break
			}

			case "repository": {
				expect(fetchSpy.mock.calls.length).toBe(5)

				break
			}

			case "tags": {
				expect(fetchSpy.mock.calls.length).toBe(8)

				break
			}

			case "resolvePreview": {
				expect(fetchSpy.mock.calls.length).toBe(8)

				break
			}

			// GraphQL requests are not shared.
			case "NOT-SHARED___graphQL": {
				expect(fetchSpy.mock.calls.length).toBe(9)

				break
			}

			default: {
				throw new Error(`Invalid mode: ${args.mode}`)
			}
		}
	})
}
