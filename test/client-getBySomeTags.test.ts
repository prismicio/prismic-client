import { it } from "./it"

it("returns paginated response", async ({ expect, client, docs }) => {
	const res = await client.getBySomeTags([
		docs.default.tags[0],
		docs.default2.tags[0],
	])
	expect(res).toMatchObject({ results: expect.any(Array) })
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getBySomeTags([docs.default.tags[0], docs.default2.tags[0]])
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[any(document.tags, ["${docs.default.tags[0]}", "${docs.default2.tags[0]}"])]]`,
	})
})
