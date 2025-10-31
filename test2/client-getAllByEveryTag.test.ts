import { it } from "./it"

it("returns multiple documents", async ({ expect, client, docs }) => {
	const res = await client.getAllByEveryTag([
		docs.default.tags[0],
		docs.default2.tags[0],
	])
	expect(res).toHaveLength(2)
})

it("can be limited", async ({ expect, client, docs }) => {
	const res = await client.getAllByEveryTag(
		[docs.default.tags[0], docs.default2.tags[0]],
		{ limit: 1 },
	)
	expect(res).toHaveLength(1)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getAllByEveryTag([docs.default.tags[0], docs.default2.tags[0]])
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[at(document.tags, ["${docs.default.tags[0]}", "${docs.default2.tags[0]}"])]]`,
	})
})

it("uses a default page size", async ({ expect, client, docs }) => {
	await client.getAllByEveryTag([docs.default.tags[0], docs.default2.tags[0]])
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})
