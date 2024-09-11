import { it as _it, expect } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"

import { ForbiddenError } from "../src"
import { AssetType } from "../src/types/api/asset/asset"

// Skip test on Node 16 (FormData support)
const isNode16 = process.version.startsWith("v16")
const it = _it.skipIf(isNode16)

it.concurrent("get assets", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets()

	expect(results).toStrictEqual(assetsDatabase[0])
})

it.concurrent("supports `pageSize` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
	})

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx.expect(req.url.searchParams.get("pageSize")).toBe("10")
		}
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({
		pageSize: 10,
	})

	ctx.expect(results).toStrictEqual(assetsDatabase[0])
	ctx.expect.assertions(2)
})

it.concurrent("supports `cursor` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2, 2],
	})

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx.expect(req.url.searchParams.get("cursor")).toBe("1")
		}
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({ cursor: "1" })

	ctx.expect(results).toStrictEqual(assetsDatabase[1])
	ctx.expect.assertions(2)
})

it.concurrent.skip("supports `assetType` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
	})

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx.expect(req.url.searchParams.get("assetType")).toBe(AssetType.Image)
		}
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({ assetType: AssetType.Image })

	ctx.expect(results).toStrictEqual(assetsDatabase[0])
	ctx.expect.assertions(2)
})

it.concurrent.skip("supports `keyword` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
	})

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx.expect(req.url.searchParams.get("keyword")).toBe("foo")
		}
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({ keyword: "foo" })

	ctx.expect(results).toStrictEqual(assetsDatabase[0])
	ctx.expect.assertions(2)
})

it.concurrent.skip("supports `ids` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
	})

	const ids = ["foo", "bar"]

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx.expect(req.url.searchParams.getAll("ids")).toStrictEqual(ids)
		}
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({ ids })

	ctx.expect(results).toStrictEqual(assetsDatabase[0])
	ctx.expect.assertions(2)
})

it.concurrent.skip("supports `tags` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
		existingTags: [
			{
				id: "00000000-4444-4444-4444-121212121212",
				name: "foo",
				created_at: 0,
				last_modified: 0,
			},
			{
				id: "10000000-4444-4444-4444-121212121212",
				name: "bar",
				created_at: 0,
				last_modified: 0,
			},
		],
	})

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx
				.expect(req.url.searchParams.getAll("tags"))
				.toStrictEqual([
					"00000000-4444-4444-4444-121212121212",
					"10000000-4444-4444-4444-121212121212",
				])
		}
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({ tags: ["foo", "bar"] })

	ctx.expect(results).toStrictEqual(assetsDatabase[0])
	ctx.expect.assertions(2)
})

it.concurrent.skip("supports `tags` parameter (missing)", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
		existingTags: [
			{
				id: "00000000-4444-4444-4444-121212121212",
				name: "foo",
				created_at: 0,
				last_modified: 0,
			},
		],
	})

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx
				.expect(req.url.searchParams.getAll("tags"))
				.toStrictEqual(["00000000-4444-4444-4444-121212121212"])
		}
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({ tags: ["foo", "bar"] })

	ctx.expect(results).toStrictEqual(assetsDatabase[0])
	ctx.expect.assertions(2)
})

it.concurrent("returns `next` when next `cursor` is available", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	// @ts-expect-error - testing purposes
	const { next: next1 } = await client.getAssets()

	ctx.expect(next1).toBeUndefined()

	mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2, 2],
	})

	// @ts-expect-error - testing purposes
	const { next: next2 } = await client.getAssets()

	ctx.expect(next2).toBeInstanceOf(Function)

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2, 2],
	})

	ctx.server.events.on("request:start", (req) => {
		if (req.url.hostname.startsWith(client.repositoryName)) {
			ctx.expect(req.url.searchParams.get("cursor")).toBe("1")
		}
	})

	const { results } = await next2!()
	ctx.expect(results).toStrictEqual(assetsDatabase[1])
	ctx.expect.assertions(4)
})

it.concurrent("throws forbidden error on invalid credentials", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client, writeToken: "invalid" })

	// @ts-expect-error - testing purposes
	await expect(() => client.getAssets()).rejects.toThrow(ForbiddenError)
})

it.concurrent("is abortable with an AbortController", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const controller = new AbortController()
	controller.abort()

	mockPrismicAssetAPI({ ctx, client })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.getAssets({
			fetchOptions: { signal: controller.signal },
		}),
	).rejects.toThrow(/aborted/i)
})

it.concurrent("supports custom headers", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const headers = { "x-custom": "foo" }

	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [2],
		requiredHeaders: headers,
	})

	// @ts-expect-error - testing purposes
	const { results } = await client.getAssets({ fetchOptions: { headers } })

	ctx.expect(results).toStrictEqual(assetsDatabase[0])
	ctx.expect.assertions(2)
})
