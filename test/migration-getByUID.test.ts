import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns a document with a matching UID", () => {
	const migration = prismic.createMigration()

	const document = {
		type: "type",
		uid: "foo",
		lang: "lang",
		data: {},
	}
	const documentName = "documentName"

	const doc = migration.createDocument(document, documentName)

	expect(migration.getByUID(document.type, document.uid)).toStrictEqual(doc)
})

it("returns `undefined` if a document is not found", () => {
	const migration = prismic.createMigration()

	const document = {
		type: "type",
		uid: "foo",
		lang: "lang",
		data: {},
	}
	const documentName = "documentName"

	migration.createDocument(document, documentName)

	expect(migration.getByUID(document.type, "bar")).toStrictEqual(undefined)
})
