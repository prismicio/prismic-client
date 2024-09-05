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

it.concurrent("discovers existing assets", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client, existingAssets: [2] })
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:existing",
		data: {
			existing: 2,
		},
	})
})

it.concurrent(
	"discovers existing assets and crawl pages if any",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client, existingAssets: [2, 3] })
		mockPrismicMigrationAPI({ ctx, client })

		const migration = prismic.createMigration()

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:existing",
			data: {
				existing: 5,
			},
		})
	},
)

it.concurrent("skips creating existing assets", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicRestAPIV2({ ctx })
	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		existingAssets: [1],
	})
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()

	const asset = assetsDatabase[0][0]
	migration.createAsset(asset)

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:skipping",
		data: {
			reason: "already exists",
			current: 1,
			remaining: 0,
			total: 1,
			asset: expect.objectContaining({ id: asset.id, file: asset.url }),
		},
	})
})

it.concurrent("creates new asset from string file data", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const asset = mockAsset(ctx)
	const dummyFileData = "foo"

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client, newAssets: [asset] })
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()
	migration.createAsset(dummyFileData, asset.filename)

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:creating",
		data: {
			current: 1,
			remaining: 0,
			total: 1,
			asset: expect.objectContaining({
				file: dummyFileData,
				filename: asset.filename,
			}),
		},
	})
})

it.concurrent("creates new asset from a File instance", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const asset = mockAsset(ctx)
	const dummyFile = new File(["foo"], asset.filename)

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client, newAssets: [asset] })
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()
	migration.createAsset(dummyFile, asset.filename)

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:creating",
		data: {
			current: 1,
			remaining: 0,
			total: 1,
			asset: expect.objectContaining({
				file: dummyFile,
				filename: asset.filename,
			}),
		},
	})
})

it.concurrent(
	"creates new asset from a file URL with content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client, newAssets: [asset] })
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.set("content-type", "image/jpg"), ctx.text("foo"))
			}),
		)

		const migration = prismic.createMigration()
		migration.createAsset(new URL(asset.url), asset.filename)

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: expect.objectContaining({
					file: new URL(asset.url),
					filename: asset.filename,
				}),
			},
		})
	},
)

it.concurrent(
	"creates new asset from a file string URL with content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client, newAssets: [asset] })
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.set("content-type", "image/jpg"), ctx.text("foo"))
			}),
		)

		const migration = prismic.createMigration()
		migration.createAsset(asset.url, asset.filename)

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: expect.objectContaining({
					file: asset.url,
					filename: asset.filename,
				}),
			},
		})
	},
)

it.concurrent(
	"creates new asset from a file URL with no content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client, newAssets: [asset] })
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.set("content-type", ""), ctx.text("foo"))
			}),
		)

		const migration = prismic.createMigration()
		migration.createAsset(new URL(asset.url), asset.filename)

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: expect.objectContaining({
					file: new URL(asset.url),
					filename: asset.filename,
				}),
			},
		})
	},
)

it.concurrent(
	"creates new asset from a file string URL with no content type",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const asset = mockAsset(ctx)

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client, newAssets: [asset] })
		mockPrismicMigrationAPI({ ctx, client })

		ctx.server.use(
			rest.get(asset.url.split("?")[0], (_req, res, ctx) => {
				return res(ctx.set("content-type", ""), ctx.text("foo"))
			}),
		)

		const migration = prismic.createMigration()
		migration.createAsset(asset.url, asset.filename)

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		expect(reporter).toHaveBeenCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: expect.objectContaining({
					file: asset.url,
					filename: asset.filename,
				}),
			},
		})
	},
)

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
		migration.createAsset(asset.url, asset.filename)

		const reporter = vi.fn()

		await expect(() =>
			client.migrate(migration, { reporter }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch foreign asset]`,
		)

		expect(reporter).toHaveBeenLastCalledWith({
			type: "assets:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				asset: expect.objectContaining({
					file: asset.url,
					filename: asset.filename,
				}),
			},
		})
	},
)
