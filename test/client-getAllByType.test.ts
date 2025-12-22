import { it } from "./it"

it("returns multiple documents", async ({ expect, client, docs }) => {
	const res = await client.getAllByType(docs.default.type)
	expect(res.length).toBeGreaterThan(1)
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default2.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default3.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default4.id }))
})

it("can be limited", async ({ expect, client, docs }) => {
	const res = await client.getAllByType(docs.default.type, { limit: 1 })
	expect(res).toHaveLength(1)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getAllByType(docs.default.type)
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[at(document.type, "${docs.default.type}")]]`,
	})
})

it("uses a default page size", async ({ expect, client, docs }) => {
	await client.getAllByType(docs.default.type)
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})
