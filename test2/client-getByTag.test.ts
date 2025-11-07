import { it } from "./it"

it("returns paginated response", async ({ expect, client, docs }) => {
	const res = await client.getByTag(docs.default.tags[0])
	expect(res).toMatchObject({ results: expect.any(Array) })
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getByTag(docs.default.tags[0])
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[any(document.tags, ["${docs.default.tags[0]}"])]]`,
	})
})
