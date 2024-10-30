import { expect, it, vi } from "vitest"

import { rest } from "msw"

import { createTestClient } from "./createClient"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import type * as prismic from "../../src"

type TestInvalidRefRetryArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>
}

export const testInvalidRefRetry = (args: TestInvalidRefRetryArgs): void => {
	it.concurrent(
		"retries with the master ref when an invalid ref is used",
		async (ctx) => {
			const client = createTestClient({ ctx })
			const badRef = ctx.mock.api.ref().ref
			const masterRef = ctx.mock.api.ref().ref
			const queryResponse = ctx.mock.api.query({
				documents: [ctx.mock.value.document()],
			})

			const triedRefs: (string | null)[] = []

			mockPrismicRestAPIV2({ ctx, queryResponse })
			const endpoint = new URL(
				"documents/search",
				`${client.documentAPIEndpoint}/`,
			).toString()
			ctx.server.use(
				rest.get(endpoint, (req) => {
					triedRefs.push(req.url.searchParams.get("ref"))
				}),
				rest.get(endpoint, (_req, res, ctx) =>
					res.once(
						ctx.json({
							type: "api_notfound_error",
							message: `Master ref is: ${masterRef}`,
						}),
						ctx.status(404),
					),
				),
			)

			const consoleWarnSpy = vi
				.spyOn(console, "warn")
				.mockImplementation(() => void 0)
			await args.run(client, { ref: badRef })
			consoleWarnSpy.mockRestore()

			expect(triedRefs).toStrictEqual([badRef, masterRef])
		},
	)

	it.concurrent(
		"retries with the master ref when an expired ref is used",
		async (ctx) => {
			const client = createTestClient({ ctx })
			const badRef = ctx.mock.api.ref().ref
			const masterRef = ctx.mock.api.ref().ref
			const queryResponse = ctx.mock.api.query({
				documents: [ctx.mock.value.document()],
			})

			const triedRefs: (string | null)[] = []

			mockPrismicRestAPIV2({ ctx, queryResponse })
			const endpoint = new URL(
				"documents/search",
				`${client.documentAPIEndpoint}/`,
			).toString()
			ctx.server.use(
				rest.get(endpoint, (req) => {
					triedRefs.push(req.url.searchParams.get("ref"))
				}),
				rest.get(endpoint, (_req, res, ctx) =>
					res.once(
						ctx.json({ message: `Master ref is: ${masterRef}` }),
						ctx.status(410),
					),
				),
			)

			const consoleWarnSpy = vi
				.spyOn(console, "warn")
				.mockImplementation(() => void 0)
			await args.run(client, { ref: badRef })
			consoleWarnSpy.mockRestore()

			expect(triedRefs).toStrictEqual([badRef, masterRef])
		},
	)
}
