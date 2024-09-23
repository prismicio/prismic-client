import { it as _it, expect, vi } from "vitest"

import { rest } from "msw"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import {
	mockAsset,
	mockPrismicAssetAPI,
} from "./__testutils__/mockPrismicAssetAPI"
import { mockPrismicMigrationAPI } from "./__testutils__/mockPrismicMigrationAPI"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import * as prismic from "../src"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

it.concurrent("creates new asset from string file data", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const asset = mockAsset(ctx)
	const dummyFileData = "foo"

	mockPrismicRestAPIV2({ ctx })
	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		newAssets: [asset],
	})
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()
	const migrationAsset = migration.createAsset(dummyFileData, asset.filename)

	const reporter = vi.fn()

	expect(assetsDatabase.flat()).toHaveLength(0)

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:creating",
		data: {
			current: 1,
			remaining: 0,
			total: 1,
			asset: migrationAsset,
		},
	})
	expect(assetsDatabase.flat()).toHaveLength(1)
})

it.concurrent("creates new asset from a File instance", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const asset = mockAsset(ctx)
	const dummyFile = new File(["foo"], asset.filename)

	mockPrismicRestAPIV2({ ctx })
	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		newAssets: [asset],
	})
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()
	const migrationAsset = migration.createAsset(dummyFile, asset.filename)

	const reporter = vi.fn()

	expect(assetsDatabase.flat()).toHaveLength(0)

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:creating",
		data: {
			current: 1,
			remaining: 0,
			total: 1,
			asset: migrationAsset,
		},
	})
	expect(assetsDatabase.flat()).toHaveLength(1)
})

it.concurrent(
	"creates new asset from a file URL with content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		const { assetsDatabase } = mockPrismicAssetAPI({
			ctx,
			client,
			newAssets: [asset],
		})
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.set("content-type", "image/jpg"), ctx.text("foo"))
			}),
		)

		const migration = prismic.createMigration()
		const migrationAsset = migration.createAsset(
			new URL(asset.url),
			asset.filename,
		)

		const reporter = vi.fn()

		expect(assetsDatabase.flat()).toHaveLength(0)

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: migrationAsset,
			},
		})
		expect(assetsDatabase.flat()).toHaveLength(1)
	},
)

it.concurrent(
	"creates new asset from a file string URL with content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		const { assetsDatabase } = mockPrismicAssetAPI({
			ctx,
			client,
			newAssets: [asset],
		})
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.set("content-type", "image/jpg"), ctx.text("foo"))
			}),
		)

		const migration = prismic.createMigration()
		const migrationAsset = migration.createAsset(asset.url, asset.filename)

		const reporter = vi.fn()

		expect(assetsDatabase.flat()).toHaveLength(0)

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: migrationAsset,
			},
		})
		expect(assetsDatabase.flat()).toHaveLength(1)
	},
)

it.concurrent(
	"creates new asset from a file URL with no content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		const { assetsDatabase } = mockPrismicAssetAPI({
			ctx,
			client,
			newAssets: [asset],
		})
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.body("foo"))
			}),
		)

		const migration = prismic.createMigration()
		const migrationAsset = migration.createAsset(
			new URL(asset.url),
			asset.filename,
		)

		const reporter = vi.fn()

		expect(assetsDatabase.flat()).toHaveLength(0)

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: migrationAsset,
			},
		})
		expect(assetsDatabase.flat()).toHaveLength(1)
	},
)

it.concurrent(
	"creates new asset from a file string URL with no content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		const { assetsDatabase } = mockPrismicAssetAPI({
			ctx,
			client,
			newAssets: [asset],
		})
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.text("foo"))
			}),
		)

		const migration = prismic.createMigration()
		const migrationAsset = migration.createAsset(asset.url, asset.filename)

		const reporter = vi.fn()

		expect(assetsDatabase.flat()).toHaveLength(0)

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: migrationAsset,
			},
		})
		expect(assetsDatabase.flat()).toHaveLength(1)
	},
)

it.concurrent("creates new asset with metadata", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const assetMetadata = {
		notes: "foo",
		alt: "bar",
		credits: "baz",
	}
	const asset = mockAsset(ctx, assetMetadata)
	const dummyFileData = "foo"

	const existingTags = [
		{
			id: "00000000-4444-4444-4444-121212121212",
			name: "qux",
			created_at: 0,
			last_modified: 0,
		},
	]

	mockPrismicRestAPIV2({ ctx })
	const { assetsDatabase, tagsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingTags,
		newAssets: [asset],
	})
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()
	migration.createAsset(dummyFileData, asset.filename, {
		...assetMetadata,
		tags: ["qux", "quux"],
	})

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	const newAsset = assetsDatabase[0][0]
	expect(newAsset.notes).toBe(assetMetadata.notes)
	expect(newAsset.alt).toBe(assetMetadata.alt)
	expect(newAsset.credits).toBe(assetMetadata.credits)
	expect(newAsset.tags).toStrictEqual(tagsDatabase)
})

it.concurrent(
	"throws on fetch error when creating a new asset from a file URL",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client, newAssets: [asset] })
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.status(429))
			}),
		)

		const migration = prismic.createMigration()
		const migrationAsset = migration.createAsset(asset.url, asset.filename)

		const reporter = vi.fn()

		await expect(() =>
			client.migrate(migration, { reporter }),
		).rejects.toThrowError(/could not fetch foreign asset/i)

		expect(reporter).toHaveBeenLastCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: migrationAsset,
			},
		})
	},
)
