import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns indexed document", () => {
	const migration = prismic.createMigration()

	const document = {
		type: "type",
		uid: "foo",
		lang: "lang",
		data: {},
	}
	const documentName = "documentName"

	migration.createDocument(document, documentName)

	expect(migration.getByUID(document.type, document.uid)).toStrictEqual(
		document,
	)
})

it("returns `undefined` is document is not found", () => {
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
