import { it } from "./it"

it("supports string ref", async ({ expect, client }) => {
	client.queryContentFromRef("ref")
	await client.get()
	expect(client).toHaveFetchedContentAPI({ ref: "ref" })
})

it("supports thunk ref", async ({ expect, client }) => {
	client.queryContentFromRef(() => "ref")
	await client.get()
	expect(client).toHaveFetchedContentAPI({ ref: "ref" })
})

it("supports async thunk ref", async ({ expect, client }) => {
	client.queryContentFromRef(async () => "ref")
	await client.get()
	expect(client).toHaveFetchedContentAPI({ ref: "ref" })
})

it("uses master ref if thunk returns non-string", async ({
	expect,
	client,
	masterRef,
}) => {
	client.queryContentFromRef(async () => undefined)
	await client.get()
	expect(client).toHaveFetchedContentAPITimes(1)
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
})
