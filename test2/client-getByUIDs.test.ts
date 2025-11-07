import { it } from "./it"

it("returns paginated response", async ({ expect, client, docs }) => {
	const res = await client.getByUIDs(docs.default.type, [
		docs.default.uid,
		docs.default2.uid,
	])
	expect(res).toMatchObject({ results: expect.any(Array) })
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getByUIDs(docs.default.type, [
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
