import { it } from "./it"

it("returns a document of a given singleton type", async ({
	expect,
	migration,
}) => {
	const doc = migration.createDocument(
		{ type: "foo", lang: "lang", data: {} },
		"title",
	)
	const res = migration.getSingle("foo")
	expect(res).toBe(doc)
})

it("returns `undefined` if a document is not found", async ({
	expect,
	migration,
}) => {
	const res = migration.getSingle("foo")
	expect(res).toBe(undefined)
})
