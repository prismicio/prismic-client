import { it as _it, expect, vi } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import * as prismic from "../src"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

it.concurrent("migrates nothing when migration is empty", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client })
	// Not mocking migration API to test we're not calling it
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
