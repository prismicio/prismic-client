import { vi } from "vitest"

import { it } from "./it"

it("returns list of tags", async ({ expect, client, docs }) => {
	const res = await client.getTags()
	expect(res).toHaveLength(2)
	expect(res).toContain(docs.default.tags[0])
	expect(res).toContain(docs.default2.tags[0])
})

it("uses form endpoint if available", async ({ expect, client, endpoint }) => {
	await client.getTags()
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).toBe(new URL("tags", endpoint).toString())
})

it("sends access token to the form endpoint", async ({
	expect,
	client,
	accessToken,
}) => {
	client.accessToken = accessToken
	await client.getTags()
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).toHaveSearchParam("access_token", accessToken)
})

it("uses repo meta if tags form is undefined", async ({ expect, client }) => {
	vi.mocked(client.fetchFn).mockResolvedValue(
		Response.json({ tags: ["foo"], forms: {} }),
	)
	const res = await client.getTags()
	expect(res).toStrictEqual(["foo"])
})

it("uses cached repository within the client's repository cache TTL", async ({
	expect,
	client,
}) => {
	vi.useFakeTimers()
	await client.getTags()
	await client.getTags()
	vi.advanceTimersByTime(5000)
	await client.getTags()
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getTags(),
		client.getTags(),
		client.getTags({ signal: controller1.signal }),
		client.getTags({ signal: controller1.signal }),
		client.getTags({ signal: controller2.signal }),
		client.getTags({ signal: controller2.signal }),
	])
	await client.getTags()
	expect(client).toHaveFetchedRepoTimes(3)
})
