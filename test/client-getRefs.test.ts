import { it } from "./it"

it("returns list of refs", async ({ expect, client }) => {
	const res = await client.getRefs()
	expect(res).toContainEqual(
		expect.objectContaining({ ref: expect.any(String) }),
	)
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getRefs(),
		client.getRefs(),
		client.getRefs({ fetchOptions: { signal: controller1.signal } }),
		client.getRefs({ fetchOptions: { signal: controller1.signal } }),
		client.getRefs({ fetchOptions: { signal: controller2.signal } }),
		client.getRefs({ fetchOptions: { signal: controller2.signal } }),
	])
	await client.getRefs()
	expect(client).toHaveFetchedRepoTimes(3)
})
