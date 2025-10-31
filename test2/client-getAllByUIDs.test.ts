import { it } from "./it"

it("returns multiple documents", async ({ expect, client, docs }) => {
	const res = await client.getAllByUIDs(docs.default.type, [
		docs.default.uid,
		docs.default2.uid,
	])
	expect(res).toHaveLength(2)
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default2.id }))
})

it("can be limited", async ({ expect, client, docs }) => {
	const res = await client.getAllByUIDs(
		docs.default.type,
		[docs.default.uid, docs.default2.uid],
		{ limit: 1 },
	)
	expect(res).toHaveLength(1)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getAllByUIDs(docs.default.type, [
		docs.default.uid,
		docs.default2.uid,
	])
	const params = new URLSearchParams()
	params.append("q", `[[at(document.type, "${docs.default.type}")]]`)
	params.append(
		"q",
		`[[in(my.${docs.default.type}.uid, ["${docs.default.uid}", "${docs.default2.uid}"])]]`,
	)
	expect(client).toHaveLastFetchedContentAPI(params)
})

it("uses a default page size", async ({ expect, client, docs }) => {
	await client.getAllByUIDs(docs.default.type, [
		docs.default.uid,
		docs.default2.uid,
	])
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})
