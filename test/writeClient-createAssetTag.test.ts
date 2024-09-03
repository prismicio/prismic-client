import { expect, it } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"

import { ForbiddenError } from "../src"
import { UNKNOWN_RATE_LIMIT_DELAY } from "../src/BaseClient"
import type { AssetTag } from "../src/types/api/asset/tag"

it.concurrent("creates a tag", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const expectedTag: AssetTag = {
		id: "00000000-4444-4444-4444-121212121212",
		name: "foo",
		created_at: 0,
		last_modified: 0,
	}

	mockPrismicAssetAPI({ ctx, client, expectedTag })

	// @ts-expect-error - testing purposes
	const tag = await client.createAssetTag(expectedTag.name)

	expect(tag).toStrictEqual(expectedTag)
})

it.concurrent("throws if tag is invalid", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createAssetTag("0"),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		`[Error: Asset tag name must be at least 3 characters long and 20 characters at most]`,
	)

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createAssetTag("0".repeat(21)),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		`[Error: Asset tag name must be at least 3 characters long and 20 characters at most]`,
	)

	await expect(
		// @ts-expect-error - testing purposes
		client.createAssetTag("valid"),
	).resolves.not.toBeUndefined()
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
it.skip("supports abort controller", async (ctx) => {
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
