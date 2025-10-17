import { vi } from "vitest"

import { it } from "./it"

import { RefNotFoundError } from "../src"

it("returns paginated response", async ({ expect, client }) => {
	const res = await client.get()
	expect(res).toMatchObject({ results: expect.any(Array) })
})

it("does not include filters by default", async ({ expect, client }) => {
	await client.get()
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).not.toHaveSearchParam("q")
})

it("supports params", async ({ expect, client }) => {
	await client.get({ lang: "fr-fr", page: 2 })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", page: "2" })
})

it("supports default params", async ({ expect, client }) => {
	client.defaultParams = { lang: "fr-fr" }
	await client.get({ page: 2 })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", page: "2" })
})

it("uses cached repository metadata within the client's repository cache TTL", async ({
	expect,
	client,
}) => {
	vi.useFakeTimers()
	await client.get()
	await client.get()
	vi.advanceTimersByTime(5000)
	await client.get()
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
	await client.get()
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
	await expect(() => client.get()).rejects.toThrow(RefNotFoundError)
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
	await client.get()
	expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	await client.get()
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
	await client.get()
	expect(client).toHaveFetchedContentAPI({ ref: "expired" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(1)
})

it("throttles invalid ref logs", async ({ expect, client, response }) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValue(response.refNotFound("invalid"))
	await expect(() => client.get()).rejects.toThrow(RefNotFoundError)
	expect(console.warn).toHaveBeenCalledTimes(1)
})

it("supports fetch options", async ({ expect, client }) => {
	await client.get({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedContentAPI({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.get({ fetchOptions: { headers: { foo: "bar" } } })
	expect(client).toHaveLastFetchedContentAPI(
		{},
		{ cache: "no-cache", headers: { foo: "bar" } },
	)
})

it("supports signal", async ({ expect, client }) => {
	const controller = new AbortController()
	controller.abort()
	await expect(() =>
		client.get({ fetchOptions: { signal: controller.signal } }),
	).rejects.toThrow("aborted")
	// TODO: Remove when `signal` is removed in favor of `fetchOptions.signal`.
	await expect(() => client.get({ signal: controller.signal })).rejects.toThrow(
		"aborted",
	)
})
