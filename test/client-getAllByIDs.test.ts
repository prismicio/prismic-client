import { it } from "./it"

it("returns multiple documents", async ({ expect, client, docs }) => {
	const res = await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(res).toHaveLength(2)
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default2.id }))
})

it("can be limited", async ({ expect, client, docs }) => {
	const res = await client.getAllByIDs([docs.default.id, docs.default2.id], {
		limit: 1,
	})
	expect(res).toHaveLength(1)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[in(document.id, ["${docs.default.id}", "${docs.default2.id}"])]]`,
	})
})

it("uses a default page size", async ({ expect, client, docs }) => {
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})
