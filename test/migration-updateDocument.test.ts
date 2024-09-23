import { expect, it } from "vitest"

import * as prismic from "../src"
import { PrismicMigrationDocument } from "../src/types/migration/Document"

it("updates a document", (ctx) => {
	const migration = prismic.createMigration()

	const document = ctx.mock.value.document()
	const documentTitle = "documentTitle"

	migration.updateDocument(document, documentTitle)

	expect(migration._documents[0]).toStrictEqual(
		new PrismicMigrationDocument(document, documentTitle),
	)
})
