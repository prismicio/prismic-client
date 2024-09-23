import { it as _it, expect } from "vitest"

import { rest } from "msw"

import { createTestWriteClient } from "./__testutils__/createWriteClient"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

it.concurrent("fetches a foreign asset with content type", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const url = `https://example.com/${client.repositoryName}.jpg`

	ctx.server.use(
		rest.get(url, (_req, res, ctx) => {
			return res(ctx.set("content-type", "image/png"), ctx.body("foo"))
		}),
	)

	// @ts-expect-error - testing purposes
	const blob = await client.fetchForeignAsset(url)

	expect(blob.type).toBe("image/png")
})

it.concurrent("fetches a foreign asset with no content type", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const url = `https://example.com/${client.repositoryName}.jpg`

	ctx.server.use(
		rest.get(url, (_req, res, ctx) => {
			return res(ctx.set("content-type", ""), ctx.body("foo"))
		}),
	)

	// @ts-expect-error - testing purposes
	const blob = await client.fetchForeignAsset(url)

	expect(blob.type).toBe("")
})

it.concurrent("is abortable with an AbortController", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const controller = new AbortController()
	controller.abort()
	const url = `https://example.com/${client.repositoryName}.jpg`

	ctx.server.use(
		rest.get(url, (_req, res, ctx) => {
			return res(ctx.set("content-type", ""), ctx.body("foo"))
		}),
	)

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.fetchForeignAsset(url, {
			fetchOptions: { signal: controller.signal },
		}),
	).rejects.toThrow(/aborted/i)
})

it.concurrent("is abortable with a global AbortController", async (ctx) => {
	const controller = new AbortController()
	controller.abort()
	const client = createTestWriteClient({
		ctx,
		clientConfig: { fetchOptions: { signal: controller.signal } },
	})

	const url = `https://example.com/${client.repositoryName}.jpg`

	ctx.server.use(
		rest.get(url, (_req, res, ctx) => {
			return res(ctx.set("content-type", ""), ctx.body("foo"))
		}),
	)

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.fetchForeignAsset(url),
	).rejects.toThrow(/aborted/i)
})

it.concurrent("supports custom headers", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const headers = { "x-custom": "foo" }
	const url = `https://example.com/${client.repositoryName}.jpg`

	ctx.server.use(
		rest.get(url, (req, res, restCtx) => {
			ctx.expect(req.headers.get("x-custom")).toBe("foo")

			return res(restCtx.text("foo"))
		}),
	)

	// @ts-expect-error - testing purposes
	const blob = await client.fetchForeignAsset(url, {
		fetchOptions: { headers },
	})

	ctx.expect(blob.type).toBe("text/plain")
	ctx.expect.assertions(2)
})

it.concurrent("supports global custom headers", async (ctx) => {
	const headers = { "x-custom": "foo" }
	const client = createTestWriteClient({
		ctx,
		clientConfig: { fetchOptions: { headers } },
	})

	const url = `https://example.com/${client.repositoryName}.jpg`

	ctx.server.use(
		rest.get(url, (req, res, restCtx) => {
			ctx.expect(req.headers.get("x-custom")).toBe("foo")

			return res(restCtx.text("foo"))
		}),
	)

	// @ts-expect-error - testing purposes
	const blob = await client.fetchForeignAsset(url)

	ctx.expect(blob.type).toBe("text/plain")
	ctx.expect.assertions(2)
})
