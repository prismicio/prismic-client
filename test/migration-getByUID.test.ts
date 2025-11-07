import { it } from "./it"

it("returns a document with a matching UID", async ({ expect, migration }) => {
	const doc = migration.createDocument(
		{ type: "type", uid: "foo", lang: "lang", data: {} },
		"title",
	)
	const res = migration.getByUID("type", "foo")
	expect(res).toBe(doc)
})

it("returns `undefined` if a document is not found", async ({
	expect,
	migration,
}) => {
	const res = migration.getByUID("type", "foo")
	expect(res).toBe(undefined)
})
