import { it as _it, expect } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"

import { ForbiddenError } from "../src"
import { UNKNOWN_RATE_LIMIT_DELAY } from "../src/BaseClient"
import type { AssetTag } from "../src/types/api/asset/tag"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

it.concurrent("creates an asset from string content", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset("file", "foo.jpg")

	expect(asset.id).toBeTypeOf("string")
})

it.concurrent("creates an asset from file content", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset(
		new File(["file"], "foo.jpg"),
		"foo.jpg",
	)

	expect(asset.id).toBeTypeOf("string")
})

it.concurrent("creates an asset with metadata", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset("file", "foo.jpg", {
		alt: "foo",
		credits: "bar",
		notes: "baz",
	})

	// TODO: Check that data are properly passed when we update MSW and get FormData support
	expect(asset.id).toBeTypeOf("string")
})

it.concurrent("creates an asset with an existing tag name", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const tag: AssetTag = {
		id: "00000000-4444-4444-4444-121212121212",
		name: "foo",
		created_at: 0,
		last_modified: 0,
	}

	mockPrismicAssetAPI({ ctx, client, existingTags: [tag] })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset("file", "foo.jpg", {
		tags: [tag.name],
	})

	expect(asset.tags?.[0].id).toEqual(tag.id)
})

it.concurrent("creates an asset with a new tag name", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const tag: AssetTag = {
		id: "00000000-4444-4444-4444-121212121212",
		name: "foo",
		created_at: 0,
		last_modified: 0,
	}

	mockPrismicAssetAPI({ ctx, client, newTags: [tag] })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset("file", "foo.jpg", {
		tags: ["foo"],
	})

	expect(asset.tags?.[0].id).toEqual(tag.id)
})

it.concurrent("throws forbidden error on invalid credentials", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client, writeToken: "invalid" })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createAsset("file", "foo.jpg"),
	).rejects.toThrow(ForbiddenError)
})

// It seems like p-limit and node-fetch are not happy friends :/
// https://github.com/sindresorhus/p-limit/issues/64
it.skip("is abortable with an AbortController", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const controller = new AbortController()
	controller.abort()

	mockPrismicAssetAPI({ ctx, client })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createAsset("file", "foo.jpg", {
			fetchOptions: { signal: controller.signal },
		}),
	).rejects.toThrow(/aborted/i)
})

it.concurrent("supports custom headers", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const headers = { "x-custom": "foo" }

	mockPrismicAssetAPI({ ctx, client, requiredHeaders: headers })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset("file", "foo.jpg", {
		fetchOptions: { headers },
	})

	ctx.expect(asset.id).toBeTypeOf("string")
	ctx.expect.assertions(2)
})

it.concurrent("respects unknown rate limit", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	const args = ["file", "foo.jpg"]

	const start = Date.now()

	// @ts-expect-error - testing purposes
	await client.createAsset(...args)

	expect(Date.now() - start).toBeLessThan(UNKNOWN_RATE_LIMIT_DELAY)

	// @ts-expect-error - testing purposes
	await client.createAsset(...args)

	expect(Date.now() - start).toBeGreaterThanOrEqual(UNKNOWN_RATE_LIMIT_DELAY)
})

it("throws fetch errors as-is", async (ctx) => {
	const client = createTestWriteClient({
		ctx,
		clientConfig: {
			fetch: () => {
				throw new Error(ctx.task.name)
			},
		},
	})

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createAsset("foo", "foo.png"),
	).rejects.toThrowError(ctx.task.name)
})
