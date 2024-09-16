import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns a document of a given singleton type", () => {
	const migration = prismic.createMigration()

	const document = {
		type: "foo",
		lang: "lang",
		data: {},
	}
	const documentName = "documentName"

	const doc = migration.createDocument(document, documentName)

	expect(migration.getSingle(document.type)).toStrictEqual(doc)
})

it("returns `undefined` if a document is not found", () => {
	const migration = prismic.createMigration()

	const document = {
		type: "foo",
		lang: "lang",
		data: {},
	}
	const documentName = "documentName"

	migration.createDocument(document, documentName)

	expect(migration.getSingle("bar")).toStrictEqual(undefined)
})
