import { expect, it } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"

import { ForbiddenError } from "../src"
import { AssetType } from "../src/types/api/asset/asset"

it.concurrent("get assets", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	const { results } = await client.getAssets()

	expect(results).toBeInstanceOf(Array)
})

it.concurrent("supports `pageSize` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({
		ctx,
		client,
		getRequiredParams: {
			pageSize: "10",
		},
	})

	const { results } = await client.getAssets({
		pageSize: 10,
	})

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("supports `cursor` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const getRequiredParams = {
		cursor: "foo",
	}

	mockPrismicAssetAPI({ ctx, client, getRequiredParams })

	const { results } = await client.getAssets(getRequiredParams)

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("supports `assetType` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const getRequiredParams = {
		assetType: AssetType.Image,
	}

	mockPrismicAssetAPI({ ctx, client, getRequiredParams })

	const { results } = await client.getAssets(getRequiredParams)

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("supports `keyword` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const getRequiredParams = {
		keyword: "foo",
	}

	mockPrismicAssetAPI({ ctx, client, getRequiredParams })

	const { results } = await client.getAssets(getRequiredParams)

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("supports `ids` parameter", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const getRequiredParams = {
		ids: ["foo", "bar"],
	}

	mockPrismicAssetAPI({ ctx, client, getRequiredParams })

	const { results } = await client.getAssets(getRequiredParams)

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("supports `tags` parameter (id)", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const getRequiredParams = {
		tags: [
			"00000000-4444-4444-4444-121212121212",
			"10000000-4444-4444-4444-121212121212",
		],
	}

	mockPrismicAssetAPI({
		ctx,
		client,
		expectedTags: [
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
		getRequiredParams,
	})

	const { results } = await client.getAssets(getRequiredParams)

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("supports `tags` parameter (name)", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const getRequiredParams = {
		tags: [
			"00000000-4444-4444-4444-121212121212",
			"10000000-4444-4444-4444-121212121212",
		],
	}

	mockPrismicAssetAPI({
		ctx,
		client,
		expectedTags: [
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
		getRequiredParams,
	})

	const { results } = await client.getAssets({ tags: ["foo", "bar"] })

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("supports `tags` parameter (missing)", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const getRequiredParams = {
		tags: ["00000000-4444-4444-4444-121212121212"],
	}

	mockPrismicAssetAPI({
		ctx,
		client,
		expectedTags: [
			{
				id: "00000000-4444-4444-4444-121212121212",
				name: "foo",
				created_at: 0,
				last_modified: 0,
			},
		],
		getRequiredParams,
	})

	const { results } = await client.getAssets({ tags: ["foo", "bar"] })

	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(2)
})

it.concurrent("returns `next` when next `cursor` is available", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	const { next: next1 } = await client.getAssets()

	ctx.expect(next1).toBeUndefined()

	const cursor = "foo"
	mockPrismicAssetAPI({ ctx, client, expectedCursor: cursor })

	const { next: next2 } = await client.getAssets()

	ctx.expect(next2).toBeInstanceOf(Function)

	mockPrismicAssetAPI({ ctx, client, getRequiredParams: { cursor } })

	const { results } = await next2!()
	ctx.expect(results).toBeInstanceOf(Array)
	ctx.expect.assertions(4)
})

it.concurrent("throws forbidden error on invalid credentials", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client, writeToken: "invalid" })

	await expect(() => client.getAssets()).rejects.toThrow(ForbiddenError)
})

it.concurrent("supports abort controller", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const controller = new AbortController()
	controller.abort()

	mockPrismicAssetAPI({ ctx, client })

	await expect(() =>
		client.getAssets({
			fetchOptions: { signal: controller.signal },
		}),
	).rejects.toThrow(/aborted/i)
})
