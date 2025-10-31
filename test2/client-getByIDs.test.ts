import { it } from "./it"

it("returns paginated response", async ({ expect, client, docs }) => {
	const res = await client.getByIDs([docs.default.id, docs.default2.id])
	expect(res).toMatchObject({ results: expect.any(Array) })
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[in(document.id, ["${docs.default.id}", "${docs.default2.id}"])]]`,
	})
})
