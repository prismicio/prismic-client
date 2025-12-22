import { it } from "./it"

import { PrismicMigrationDocument } from "../src"

it("returns a migration document", async ({ expect, migration }) => {
	const doc = { type: "type", uid: "uid", lang: "lang", data: {} }
	const res = migration.createDocument(doc, "title")
	expect(res).toBeInstanceOf(PrismicMigrationDocument)
	expect(res.document).toBe(doc)
	expect(res.originalPrismicDocument).toBe(undefined)
	expect(res.title).toBe("title")
})

it("creates a document", async ({ expect, migration }) => {
	const res = migration.createDocument(
		{ type: "type", uid: "uid", lang: "lang", data: {} },
		"title",
	)
	expect(migration._documents).toContain(res)
})
