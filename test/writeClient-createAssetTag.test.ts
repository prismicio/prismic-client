import { it as _it, expect } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"

import { ForbiddenError } from "../src"
import { UNKNOWN_RATE_LIMIT_DELAY } from "../src/BaseClient"
import type { AssetTag } from "../src/types/api/asset/tag"

// Skip test on Node 16 (FormData support)
const isNode16 = process.version.startsWith("v16")
const it = _it.skipIf(isNode16)

it.concurrent("creates a tag", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const newTag: AssetTag = {
		id: "00000000-4444-4444-4444-121212121212",
		name: "foo",
		created_at: 0,
		last_modified: 0,
	}

	mockPrismicAssetAPI({ ctx, client, newTags: [newTag] })

	// @ts-expect-error - testing purposes
	const tag = await client.createAssetTag(newTag.name)

	expect(tag).toStrictEqual(newTag)
})

it.concurrent("throws forbidden error on invalid credentials", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client, writeToken: "invalid" })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createAssetTag("foo"),
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
		client.createAssetTag("foo", {
			fetchOptions: { signal: controller.signal },
		}),
	).rejects.toThrow(/aborted/i)
})

it.concurrent("supports custom headers", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const headers = { "x-custom": "foo" }

	const newTag: AssetTag = {
		id: "00000000-4444-4444-4444-121212121212",
		name: "foo",
		created_at: 0,
		last_modified: 0,
	}

	mockPrismicAssetAPI({
		ctx,
		client,
		requiredHeaders: headers,
		newTags: [newTag],
	})

	// @ts-expect-error - testing purposes
	const tag = await client.createAssetTag(newTag.name, {
		fetchOptions: { headers },
	})

	ctx.expect(tag).toStrictEqual(newTag)
	ctx.expect.assertions(2)
})

it.concurrent("respects unknown rate limit", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	const args = ["foo"]

	const start = Date.now()

	// @ts-expect-error - testing purposes
	await client.createAssetTag(...args)

	expect(Date.now() - start).toBeLessThan(UNKNOWN_RATE_LIMIT_DELAY)

	// @ts-expect-error - testing purposes
	await client.createAssetTag(...args)

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
		client.createAssetTag("foo"),
	).rejects.toThrowError(ctx.task.name)
})
