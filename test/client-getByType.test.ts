import { it } from "./it"

it("returns paginated response", async ({ expect, client, docs }) => {
	const res = await client.getByType(docs.default.type)
	expect(res).toMatchObject({ results: expect.any(Array) })
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getByType(docs.default.type)
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[at(document.type, "${docs.default.type}")]]`,
	})
})
