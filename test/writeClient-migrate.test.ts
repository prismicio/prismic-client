import { expect, it } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"
import { mockPrismicMigrationAPI } from "./__testutils__/mockPrismicMigrationAPI"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import * as prismic from "../src"

it("migrates nothing when migration is empty", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()

	await expect(client.migrate(migration)).resolves.toBeUndefined()
})
