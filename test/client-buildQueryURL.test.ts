import { vi } from "vitest"

import { it } from "./it"

it("returns a content api url", async ({ expect, client, endpoint }) => {
	const res = new URL(await client.buildQueryURL())
	expect(res.origin).toBe(new URL(endpoint).origin)
	expect(res.pathname).toBe(new URL("documents/search", endpoint).pathname)
})

it("includes master ref", async ({ expect, client, masterRef }) => {
	const res = await client.buildQueryURL()
	expect(res).toHaveSearchParam("ref", masterRef)
})

it("supports params", async ({ expect, client }) => {
	const res = await client.buildQueryURL({ lang: "fr-fr", page: 2 })
	expect(res).toHaveSearchParam("lang", "fr-fr")
	expect(res).toHaveSearchParam("page", "2")
})

it("supports default params", async ({ expect, client }) => {
	client.defaultParams = { lang: "fr-fr" }
	const res = await client.buildQueryURL({ page: 2 })
	expect(res).toHaveSearchParam("lang", "fr-fr")
	expect(res).toHaveSearchParam("page", "2")
})

it("uses cached repository metadata within the client's repository cache TTL", async ({
	expect,
	client,
}) => {
	vi.useFakeTimers()
	await client.buildQueryURL()
	await client.buildQueryURL()
	vi.advanceTimersByTime(5000)
	await client.buildQueryURL()
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("supports fetch options", async ({ expect, client }) => {
	await client.buildQueryURL({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.buildQueryURL({ fetchOptions: { headers: { foo: "bar" } } })
	expect(client).toHaveLastFetchedRepo(
		{},
		{ cache: "no-cache", headers: { foo: "bar" } },
	)
})

it("supports signal", async ({ expect, client }) => {
	await expect(() =>
		client.buildQueryURL({ fetchOptions: { signal: AbortSignal.abort() } }),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.buildQueryURL(),
		client.buildQueryURL(),
		client.buildQueryURL({ signal: controller1.signal }),
		client.buildQueryURL({ signal: controller1.signal }),
		client.buildQueryURL({ signal: controller2.signal }),
		client.buildQueryURL({ signal: controller2.signal }),
	])
	await client.buildQueryURL()
	expect(client).toHaveFetchedRepoTimes(3)
})
