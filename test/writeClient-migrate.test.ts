import { it as _it, expect, vi } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import {
	mockAsset,
	mockPrismicAssetAPI,
} from "./__testutils__/mockPrismicAssetAPI"
import { mockPrismicMigrationAPI } from "./__testutils__/mockPrismicMigrationAPI"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import * as prismic from "../src"
import type { AssetMap } from "../src/types/migration/Asset"
import type { DocumentMap } from "../src/types/migration/Document"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

it.concurrent("performs migration", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const asset = mockAsset(ctx)
	const newDocuments = [{ id: "foo" }, { id: "bar" }]

	mockPrismicRestAPIV2({ ctx })
	const { assetsDatabase } = mockPrismicAssetAPI({
		ctx,
		client,
		newAssets: [asset],
	})
	const { documentsDatabase } = mockPrismicMigrationAPI({
		ctx,
		client,
		newDocuments,
	})

	const migration = prismic.createMigration()

	const documentFoo: prismic.PrismicMigrationDocument =
		ctx.mock.value.document()
	documentFoo.data = {
		image: migration.createAsset("foo", "foo.png"),
		link: () => migration.getByUID("bar", "bar"),
	}

	const documentBar = ctx.mock.value.document()
	documentBar.type = "bar"
	documentBar.uid = "bar"

	migration.createDocument(documentFoo, "foo")
	migration.createDocument(documentBar, "bar")

	let documents: DocumentMap | undefined
	let assets: AssetMap | undefined
	const reporter = vi.fn<(event: prismic.MigrateReporterEvents) => void>(
		(event) => {
			if (event.type === "assets:created") {
				assets = event.data.assets
			} else if (event.type === "documents:created") {
				documents = event.data.documents
			}
		},
	)

	await client.migrate(migration, { reporter })

	expect(assets?.size).toBe(1)
	expect(assetsDatabase.flat()).toHaveLength(1)
	// Documents are indexed twice, on ID, and on reference
	expect(documents?.size).toBe(4)
	expect(Object.keys(documentsDatabase)).toHaveLength(2)

	expect(reporter).toHaveBeenCalledWith({
		type: "start",
		data: {
			pending: {
				documents: 2,
				assets: 1,
			},
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:created",
		data: {
			created: 1,
			assets: expect.any(Map),
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:created",
		data: {
			created: 2,
			documents: expect.any(Map),
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:updated",
		data: {
			updated: 2,
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "end",
		data: {
			migrated: {
				documents: 2,
				assets: 1,
			},
		},
	})
})

it.concurrent("migrates nothing when migration is empty", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client })
	// Not mocking Migration API to test we're not calling it
	// mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "start",
		data: {
			pending: {
				documents: 0,
				assets: 0,
			},
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "assets:created",
		data: {
			created: 0,
			assets: expect.any(Map),
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:created",
		data: {
			created: 0,
			documents: expect.any(Map),
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:updated",
		data: {
			updated: 0,
		},
	})

	expect(reporter).toHaveBeenCalledWith({
		type: "end",
		data: {
			migrated: {
				documents: 0,
				assets: 0,
			},
		},
	})
})
