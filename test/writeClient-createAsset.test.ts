import { it as _it, expect } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"

import { ForbiddenError } from "../src"
import { UNKNOWN_RATE_LIMIT_DELAY } from "../src/BaseClient"
import type { AssetTag } from "../src/types/api/asset/tag"

// Skip test on Node 16 and 18
const hasFileConstructor = typeof File === "function"
const it = _it.skipIf(!hasFileConstructor)

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

	expect(asset.id).toBeTypeOf("string")
})

it.concurrent("creates an asset with an existing tag ID", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const tag: AssetTag = {
		id: "00000000-4444-4444-4444-121212121212",
		name: "foo",
		created_at: 0,
		last_modified: 0,
	}

	mockPrismicAssetAPI({ ctx, client, expectedTags: [tag] })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset("file", "foo.jpg", {
		tags: [tag.id],
	})

	expect(asset.tags?.[0].id).toEqual(tag.id)
})

it.concurrent("creates an asset with an existing tag name", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const tag: AssetTag = {
		id: "00000000-4444-4444-4444-121212121212",
		name: "foo",
		created_at: 0,
		last_modified: 0,
	}

	mockPrismicAssetAPI({ ctx, client, expectedTags: [tag] })

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

	mockPrismicAssetAPI({ ctx, client, expectedTag: tag })

	// @ts-expect-error - testing purposes
	const asset = await client.createAsset("file", "foo.jpg", {
		tags: ["foo"],
	})

	expect(asset.tags?.[0].id).toEqual(tag.id)
})

it.concurrent("throws if asset has invalid metadata", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicAssetAPI({ ctx, client })

	const filename = "foo.jpg"
	const file = "https://example.com/foo.jpg"

	await expect(
		() =>
			// @ts-expect-error - testing purposes
			client.createAsset(file, filename, { notes: "0".repeat(501) }),
		"notes",
	).rejects.toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: \`notes\` must be at most 500 characters]`,
	)

	await expect(
		() =>
			// @ts-expect-error - testing purposes
			client.createAsset(file, filename, { credits: "0".repeat(501) }),
		"credits",
	).rejects.toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: \`credits\` must be at most 500 characters]`,
	)

	await expect(
		() =>
			// @ts-expect-error - testing purposes
			client.createAsset(file, filename, { alt: "0".repeat(501) }),
		"alt",
	).rejects.toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: \`alt\` must be at most 500 characters]`,
	)

	await expect(
		() =>
			// @ts-expect-error - testing purposes
			client.createAsset(file, filename, { tags: ["0"] }),
		"tags",
	).rejects.toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: all \`tags\`'s tag must be at least 3 characters long and 20 characters at most]`,
	)

	await expect(
		() =>
			// @ts-expect-error - testing purposes
			client.createAsset(file, filename, { tags: ["0".repeat(21)] }),
		"tags",
	).rejects.toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: all \`tags\`'s tag must be at least 3 characters long and 20 characters at most]`,
	)

	await expect(
		// @ts-expect-error - testing purposes
		client.createAsset(file, filename, {
			tags: [
				// Tag name
				"012",
				// Tag ID
				"00000000-4444-4444-4444-121212121212",
			],
		}),
		"tags",
	).resolves.not.toBeUndefined()
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
it.skip("supports abort controller", async (ctx) => {
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
