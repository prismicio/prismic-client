import { expect, it, vi } from "vitest"

import { rest } from "msw"

import { createTestClient } from "./createClient"
import { getMasterRef } from "./getMasterRef"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import * as prismic from "../../src"

type TestInvalidRefRetryArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>
}

export const testInvalidRefRetry = (
	description: string,
	args: TestInvalidRefRetryArgs,
): void => {
	it.concurrent(description, async (ctx) => {
		const client = createTestClient({ ctx })

		const triedRefs: string[] = []

		const repositoryResponse = ctx.mock.api.repository()
		repositoryResponse.refs = [ctx.mock.api.ref({ isMasterRef: true })]

		const latestRef = ctx.mock.api.ref().ref

		mockPrismicRestAPIV2({ ctx, repositoryResponse })

		const queryEndpoint = new URL(
			"documents/search",
			`${client.documentAPIEndpoint}/`,
		).toString()

		ctx.server.use(
			rest.get(queryEndpoint, (req, res, ctx) => {
				const ref = req.url.searchParams.get("ref")
				if (ref) {
					triedRefs.push(ref)
				}

				if (triedRefs.length <= 1) {
					return res(
						ctx.status(404),
						ctx.json({
							type: "api_notfound_error",
							message: `Ref not found. Ensure you have the correct ref and try again. Master ref is: ${latestRef}`,
						}),
					)
				}
			}),
		)

		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => void 0)

		await args.run(client)

		expect(triedRefs).toStrictEqual([
			getMasterRef(repositoryResponse),
			latestRef,
		])

		// Check that refs are not retried more than once.
		ctx.server.use(
			rest.get(queryEndpoint, (_req, res, ctx) => {
				return res(
					ctx.status(404),
					ctx.json({
						type: "api_notfound_error",
						message: `Ref not found. Ensure you have the correct ref and try again. Master ref is: ${triedRefs[0]}`,
					}),
				)
			}),
		)

		await expect(async () => {
			await args.run(client)
		}).rejects.toThrow(prismic.RefNotFoundError)

		consoleWarnSpy.mockRestore()
	})
}
