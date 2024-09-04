import { it as _it, expect, vi } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import * as prismic from "../src"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

it("migrates nothing when migration is empty", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client })
	// Not mocking migration API to test we're not calling it
	// mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()

	const reporter = vi.fn()

	await expect(client.migrate(migration, { reporter })).resolves.toBeUndefined()

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
