import { it } from "./it"

import { PrismicMigrationDocument } from "../src"

it("returns a migration document", async ({ expect, migration, docs }) => {
	const res = migration.updateDocument(docs.default, "title")
	expect(res).toBeInstanceOf(PrismicMigrationDocument)
	expect(res.document).toBe(docs.default)
	expect(res.originalPrismicDocument).toBe(undefined)
	expect(res.title).toBe("title")
})

it("updates a document", async ({ expect, docs, migration }) => {
	const res = migration.updateDocument(docs.default, "title")
	expect(migration._documents).toContain(res)
})
