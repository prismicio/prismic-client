import { vi } from "vitest"

import { it } from "./it"

import { NotFoundError, RefNotFoundError } from "../src"

it("returns single document", async ({ expect, client }) => {
	const res = await client.getFirst()
	expect(res).toMatchObject({ id: expect.any(String) })
})

it("optimizes page size", async ({ expect, client }) => {
	await client.getFirst()
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "1" })
	expect(client).toHaveFetchedContentAPITimes(1)
})

it("allows overriding default pageSize param", async ({ expect, client }) => {
	const res = await client.getFirst({ pageSize: 2 })
	expect(res).toMatchObject({ id: expect.any(String) })
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "2" })
})

it("throws if no document is returned", async ({
	expect,
	client,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockImplementationOnce(fetch)
		.mockResolvedValueOnce(response.search([]))
	await expect(() => client.getFirst()).rejects.toThrow(NotFoundError)
})

it("does not include filters by default", async ({ expect, client }) => {
	await client.getFirst()
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).not.toHaveSearchParam("q")
})

it("supports params", async ({ expect, client }) => {
	await client.getFirst({ lang: "fr-fr", routes: [] })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
})

it("supports default params", async ({ expect, client }) => {
	client.defaultParams = { lang: "fr-fr" }
	await client.get({ routes: [] })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
})

it("uses cached repository metadata within the client's repository cache TTL", async ({
	expect,
	client,
}) => {
	vi.useFakeTimers()
	await client.getFirst()
	await client.getFirst()
	vi.advanceTimersByTime(5000)
	await client.getFirst()
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("retries with the master ref when an invalid ref is used", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValueOnce(response.refNotFound(masterRef))
	await client.getFirst()
	expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(1)
})

it("throws if the maximum number of retries with invalid refs is reached", async ({
	expect,
	client,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValue(response.refNotFound("invalid"))
	await expect(() => client.getFirst()).rejects.toThrow(RefNotFoundError)
	expect(client).toHaveFetchedContentAPITimes(3)
})

it("fetches a new master ref on subsequent queries if an invalid ref is used", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValueOnce(response.refNotFound(masterRef))
	await client.getFirst()
	expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	await client.getFirst()
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(2)
})

it("retries with the master ref when an expired ref is used", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("expired"))
		.mockResolvedValueOnce(response.refExpired(masterRef))
	await client.getFirst()
	expect(client).toHaveFetchedContentAPI({ ref: "expired" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(1)
})

it("throttles invalid ref logs", async ({ expect, client, response }) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValue(response.refNotFound("invalid"))
	await expect(() => client.getFirst()).rejects.toThrow(RefNotFoundError)
	expect(console.warn).toHaveBeenCalledTimes(1)
})

it("supports fetch options", async ({ expect, client }) => {
	await client.getFirst({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedContentAPI({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getFirst({ fetchOptions: { headers: { foo: "bar" } } })
	expect(client).toHaveLastFetchedContentAPI(
		{},
		{ cache: "no-cache", headers: { foo: "bar" } },
	)
})

it("supports signal", async ({ expect, client }) => {
	await expect(() =>
		client.getFirst({ fetchOptions: { signal: AbortSignal.abort() } }),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getFirst(),
		client.getFirst(),
		client.getFirst({ signal: controller1.signal }),
		client.getFirst({ signal: controller1.signal }),
		client.getFirst({ signal: controller2.signal }),
		client.getFirst({ signal: controller2.signal }),
	])
	await client.getFirst()
	expect(client).toHaveFetchedRepoTimes(3)
	expect(client).toHaveFetchedContentAPITimes(4)
})
