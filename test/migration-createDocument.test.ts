import { expect, it } from "vitest"

import * as prismic from "../src"
import { PrismicMigrationDocument } from "../src/types/migration/Document"

it("creates a document", () => {
	const migration = prismic.createMigration()

	const document: prismic.PendingPrismicDocument = {
		type: "type",
		uid: "uid",
		lang: "lang",
		data: {},
	}
	const documentTitle = "documentTitle"

	migration.createDocument(document, documentTitle)

	expect(migration._documents[0]).toStrictEqual(
		new PrismicMigrationDocument(document, documentTitle),
	)
})
