import { expect, it, vi } from "vitest"

import { rest } from "msw"

import { createTestClient } from "./createClient"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import * as prismic from "../../src"

type TestInvalidRefRetryArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>
}

export const testInvalidRefRetry = (args: TestInvalidRefRetryArgs): void => {
	it("retries with the master ref when an invalid ref is used", async (ctx) => {
		const client = createTestClient({ ctx })
		const badRef = ctx.mock.api.ref().ref
		const masterRef = ctx.mock.api.ref().ref
		const queryResponse = ctx.mock.api.query({
			documents: [ctx.mock.value.document()],
		})

		const triedRefs = new Set<string | null>()

		mockPrismicRestAPIV2({ ctx, queryResponse })
		const endpoint = new URL(
			"documents/search",
			`${client.documentAPIEndpoint}/`,
		).toString()
		ctx.server.use(
			rest.get(endpoint, (req) => {
				triedRefs.add(req.url.searchParams.get("ref"))
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

		expect([...triedRefs]).toStrictEqual([badRef, masterRef])
	})

	it("retries with the master ref when an expired ref is used", async (ctx) => {
		const client = createTestClient({ ctx })
		const badRef = ctx.mock.api.ref().ref
		const masterRef = ctx.mock.api.ref().ref
		const queryResponse = ctx.mock.api.query({
			documents: [ctx.mock.value.document()],
		})

		const triedRefs = new Set<string | null>()

		mockPrismicRestAPIV2({ ctx, queryResponse })
		const endpoint = new URL(
			"documents/search",
			`${client.documentAPIEndpoint}/`,
		).toString()
		ctx.server.use(
			rest.get(endpoint, (req) => {
				triedRefs.add(req.url.searchParams.get("ref"))
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

		expect([...triedRefs]).toStrictEqual([badRef, masterRef])
	})

	it("throws if the maximum number of retries with invalid refs is reached", async (ctx) => {
		const client = createTestClient({ ctx })
		const queryResponse = ctx.mock.api.query({
			documents: [ctx.mock.value.document()],
		})

		const triedRefs = new Set<string | null>()

		mockPrismicRestAPIV2({ ctx, queryResponse })
		const endpoint = new URL(
			"documents/search",
			`${client.documentAPIEndpoint}/`,
		).toString()
		ctx.server.use(
			rest.get(endpoint, (req) => {
				triedRefs.add(req.url.searchParams.get("ref"))
			}),
			rest.get(endpoint, (_req, res, requestCtx) =>
				res(
					requestCtx.json({
						type: "api_notfound_error",
						message: `Master ref is: ${ctx.mock.api.ref().ref}`,
					}),
					requestCtx.status(404),
				),
			),
		)

		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => void 0)
		await expect(async () => {
			await args.run(client)
		}).rejects.toThrow(prismic.RefNotFoundError)
		consoleWarnSpy.mockRestore()

		expect(triedRefs.size).toBe(3)
	})

	it("fetches a new master ref on subsequent queries if an invalid ref is used", async (ctx) => {
		const client = createTestClient({ ctx })
		const queryResponse = ctx.mock.api.query({
			documents: [ctx.mock.value.document()],
		})

		const triedRefs = new Set<string | null>()

		mockPrismicRestAPIV2({ ctx, queryResponse })
		const endpoint = new URL(
			"documents/search",
			`${client.documentAPIEndpoint}/`,
		).toString()
		ctx.server.use(
			rest.get(endpoint, (req) => {
				triedRefs.add(req.url.searchParams.get("ref"))
			}),
			rest.get(endpoint, (_req, res, requestCtx) =>
				res.once(
					requestCtx.json({
						type: "api_notfound_error",
						message: `Master ref is: ${ctx.mock.api.ref().ref}`,
					}),
					requestCtx.status(404),
				),
			),
		)

		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => void 0)
		await args.run(client)
		consoleWarnSpy.mockRestore()

		await args.run(client)

		expect(triedRefs.size).toBe(3)
	})

	it("throttles log", async (ctx) => {
		const client = createTestClient({ ctx })
		const badRef = ctx.mock.api.ref().ref

		mockPrismicRestAPIV2({ ctx })

		const endpoint = new URL(
			"documents/search",
			`${client.documentAPIEndpoint}/`,
		).toString()
		let attempts = 0
		ctx.server.use(
			rest.get(endpoint, (_req, res, ctx) => {
				if (attempts < 2) {
					attempts++

					// We purposely return the bad ref again
					// to force a loop.
					return res(
						ctx.json({
							type: "api_notfound_error",
							message: `Master ref is: ${badRef}`,
						}),
						ctx.status(404),
					)
				}
			}),
		)

		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => void 0)
		await args.run(client, { ref: badRef })

		// The client should make two attemps but only log once.
		expect(attempts).toBe(2)
		expect(consoleWarnSpy).toHaveBeenCalledTimes(1)

		consoleWarnSpy.mockRestore()
	})
}
