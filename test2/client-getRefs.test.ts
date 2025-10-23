import { vi } from "vitest"

import { it } from "./it"

it("returns list of refs", async ({ expect, client }) => {
	const res = await client.getRefs()
	expect(res).toContainEqual(
		expect.objectContaining({ ref: expect.any(String) }),
	)
})

it("uses cached repository within the client's repository cache TTL", async ({
	expect,
	client,
}) => {
	vi.useFakeTimers()
	await client.getRefs()
	await client.getRefs()
	vi.advanceTimersByTime(5000)
	await client.getRefs()
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("supports fetch options", async ({ expect, client }) => {
	await client.getRefs({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getRefs({ fetchOptions: { headers: { foo: "bar" } } })
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
		client.getRefs({ fetchOptions: { signal: AbortSignal.abort() } }),
	).rejects.toThrow("aborted")
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
		client.getRefs({ signal: controller1.signal }),
		client.getRefs({ signal: controller1.signal }),
		client.getRefs({ signal: controller2.signal }),
		client.getRefs({ signal: controller2.signal }),
	])
	await client.getRefs()
	expect(client).toHaveFetchedRepoTimes(3)
})
