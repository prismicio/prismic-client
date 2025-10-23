import { vi } from "vitest"

import { it } from "./it"

it("returns master ref", async ({ expect, client, masterRef }) => {
	const res = await client.getMasterRef()
	expect(res).toMatchObject({ ref: masterRef })
})

it("uses cached repository within the client's repository cache TTL", async ({
	expect,
	client,
}) => {
	vi.useFakeTimers()
	await client.getMasterRef()
	await client.getMasterRef()
	vi.advanceTimersByTime(5000)
	await client.getMasterRef()
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("supports fetch options", async ({ expect, client }) => {
	await client.getMasterRef({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getMasterRef({
		fetchOptions: { headers: { foo: "bar" } },
	})
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
		client.getMasterRef({
			fetchOptions: { signal: AbortSignal.abort() },
		}),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getMasterRef(),
		client.getMasterRef(),
		client.getMasterRef({ signal: controller1.signal }),
		client.getMasterRef({ signal: controller1.signal }),
		client.getMasterRef({ signal: controller2.signal }),
		client.getMasterRef({ signal: controller2.signal }),
	])
	await client.getMasterRef()
	expect(client).toHaveFetchedRepoTimes(3)
})
