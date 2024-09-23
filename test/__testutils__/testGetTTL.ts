import { expect, it } from "vitest"

import { rest } from "msw"

import { createTestClient } from "./createClient"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import type * as prismic from "../../src"

/**
 * The number of milliseconds in which repository metadata is considered valid.
 * A ref can be invalidated quickly depending on how frequently content is
 * updated in the Prismic repository. As such, repository's metadata can only be
 * considered valid for a short amount of time.
 *
 * IMPORTANT: This value is linked to `REPOSITORY_CACHE_TTL` used in
 * `../src/createClient.ts`. The two values do not need to be kept in sync, but
 * note that changing `REPOSITORY_CACHE_TTL` in the public code may have an
 * effect on tests using this test-specific constant.
 */
export const REPOSITORY_CACHE_TTL = 5000

type GetContext = {
	repositoryResponse?: Partial<prismic.Repository>
	getRef(repository: prismic.Repository): string
}

type TestGetWithinTTLArgs = {
	getContext: GetContext
	beforeFirstGet: (args: { client: prismic.Client }) => void
	requestParams?: Parameters<prismic.Client["get"]>[0]
}

export const testGetWithinTTL = (
	description: string,
	args: TestGetWithinTTLArgs,
): void => {
	it(description, async (ctx) => {
		const repositoryResponse = {
			...ctx.mock.api.repository(),
			...args.getContext.repositoryResponse,
		}
		const ref = args.getContext.getRef(repositoryResponse)
		const queryResponse = ctx.mock.api.query()

		mockPrismicRestAPIV2({
			repositoryResponse,
			queryResponse,
			queryRequiredParams: {
				ref,
			},
			ctx,
		})

		const client = createTestClient({ ctx })

		if (args.beforeFirstGet) {
			args.beforeFirstGet({ client })
		}

		const res1 = await client.get()

		// We're setting the next repository metadata response to include a different ref.
		// Notice that we aren't setting a new query handler. The next query should
		// use the previous ref.
		ctx.server.use(
			rest.get(client.endpoint, (_req, res, serverCtx) => {
				return res(serverCtx.json(ctx.mock.api.repository()))
			}),
		)

		const res2 = await client.get()

		expect(res1).toStrictEqual(queryResponse)
		expect(res2).toStrictEqual(queryResponse)
	})
}

type TestGetOutsideTTLArgs = {
	getContext1: GetContext
	getContext2: GetContext
	beforeFirstGet: (args: { client: prismic.Client }) => void
}

export const testGetOutsideTTL = (
	description: string,
	args: TestGetOutsideTTLArgs,
): void => {
	it.concurrent(
		description,
		async (ctx) => {
			const repositoryResponse1 = {
				...ctx.mock.api.repository(),
				...args.getContext1.repositoryResponse,
			}
			const ref1 = args.getContext1.getRef(repositoryResponse1)
			const queryResponse1 = ctx.mock.api.query()

			const repositoryResponse2 = {
				...ctx.mock.api.repository(),
				...args.getContext2.repositoryResponse,
			}
			const ref2 = args.getContext2.getRef(repositoryResponse2)
			const queryResponse2 = ctx.mock.api.query()

			mockPrismicRestAPIV2({
				repositoryResponse: repositoryResponse1,
				queryResponse: queryResponse1,
				queryRequiredParams: {
					ref: ref1,
				},
				ctx,
			})

			const client = createTestClient({ ctx })

			if (args.beforeFirstGet) {
				args.beforeFirstGet({ client })
			}

			const res1 = await client.get()

			// We wait for the cached ref's TTL to expire.
			await new Promise((res) =>
				setTimeout(() => res(undefined), REPOSITORY_CACHE_TTL + 1),
			)

			// We're setting the next repository metadata response to include a different ref.
			// We're also using a new query handler using the new master ref.
			mockPrismicRestAPIV2({
				repositoryResponse: repositoryResponse2,
				queryResponse: queryResponse2,
				queryRequiredParams: {
					ref: ref2,
				},
				ctx,
			})

			const res2 = await client.get()

			expect(res1).toStrictEqual(queryResponse1)
			expect(res2).toStrictEqual(queryResponse2)
		},
		REPOSITORY_CACHE_TTL * 2,
	)
}
