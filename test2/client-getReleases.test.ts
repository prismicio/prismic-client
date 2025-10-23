import { it } from "./it"

it("returns list of releases", async ({ expect, client, accessToken }) => {
	client.accessToken = accessToken
	const res = await client.getReleases()
	expect(res).toContainEqual(
		expect.objectContaining({ ref: expect.any(String) }),
	)
	expect(res).not.toContainEqual(expect.objectContaining({ isMasterRef: true }))
})

it("supports fetch options", async ({ expect, client }) => {
	await client.getReleases({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getReleases({ fetchOptions: { headers: { foo: "bar" } } })
	expect(client).toHaveLastFetchedRepo(
		{},
		{
			cache: "no-cache",
			headers: { foo: "bar" },
		},
	)
})

it("supports signal", async ({ expect, client }) => {
	await expect(() =>
		client.getReleases({ fetchOptions: { signal: AbortSignal.abort() } }),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getReleases(),
		client.getReleases(),
		client.getReleases({ signal: controller1.signal }),
		client.getReleases({ signal: controller1.signal }),
		client.getReleases({ signal: controller2.signal }),
		client.getReleases({ signal: controller2.signal }),
	])
	await client.getReleases()
	expect(client).toHaveFetchedRepoTimes(4)
})
