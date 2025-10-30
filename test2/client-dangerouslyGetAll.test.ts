import { vi } from "vitest"

import { it } from "./it"

import { RefNotFoundError } from "../src"

it("returns multiple documents", async ({ expect, client, docs }) => {
	const res = await client.dangerouslyGetAll()
	expect(res.length).toBeGreaterThan(1)
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default2.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default3.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default4.id }))
	expect(res).toContainEqual(
		expect.objectContaining({ id: docs.defaultSingle.id }),
	)
})

it("can be limited", async ({ expect, client }) => {
	const res = await client.dangerouslyGetAll({ limit: 1 })
	expect(res).toHaveLength(1)
})

it("does not include filters by default", async ({ expect, client }) => {
	await client.dangerouslyGetAll()
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).not.toHaveSearchParam("q")
})

it("uses a default page size", async ({ expect, client }) => {
	await client.dangerouslyGetAll()
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})

it("throttles requests with multiple pages", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo(masterRef))
		.mockResolvedValueOnce(response.search([{ id: "1" }], { next_page: "1" }))
		.mockResolvedValueOnce(response.search([{ id: "1" }]))
	vi.useFakeTimers()
	const start = performance.now()
	const promise = client.dangerouslyGetAll()
	await vi.runAllTimersAsync()
	await promise
	expect(client).toHaveFetchedContentAPITimes(2)
	expect(performance.now() - start).toBe(500)
	vi.useRealTimers()
})

it("does not throttle single page requests", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo(masterRef))
		.mockResolvedValueOnce(response.search([{ id: "1" }]))
	vi.useFakeTimers()
	const start = performance.now()
	const promise = client.dangerouslyGetAll()
	await vi.runAllTimersAsync()
	await promise
	expect(performance.now() - start).toBe(0)
	vi.useRealTimers()
})

it("optimizes page size when the limit is below the page size", async ({
	expect,
	client,
}) => {
	await client.dangerouslyGetAll({ limit: 2 })
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "2" })
})

it("does not optimize page size when the limit is above the page size", async ({
	expect,
	client,
}) => {
	await client.dangerouslyGetAll({ limit: 150 })
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})

it("supports params", async ({ expect, client }) => {
	await client.dangerouslyGetAll({ lang: "fr-fr" })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr" })
})

it("supports default params", async ({ expect, client }) => {
	client.defaultParams = { lang: "fr-fr" }
	await client.dangerouslyGetAll({ routes: [] })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
})

it("uses cached repository metadata within the client's repository cache TTL", async ({
	expect,
	client,
}) => {
	vi.useFakeTimers()
	await client.dangerouslyGetAll()
	await client.dangerouslyGetAll()
	vi.advanceTimersByTime(5000)
	await client.dangerouslyGetAll()
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
	await client.dangerouslyGetAll()
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
	await expect(() => client.dangerouslyGetAll()).rejects.toThrow(
		RefNotFoundError,
	)
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
	await client.dangerouslyGetAll()
	expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	await client.dangerouslyGetAll()
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
	await client.dangerouslyGetAll()
	expect(client).toHaveFetchedContentAPI({ ref: "expired" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(1)
})

it("throttles invalid ref logs", async ({ expect, client, response }) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValue(response.refNotFound("invalid"))
	await expect(() => client.dangerouslyGetAll()).rejects.toThrow(
		RefNotFoundError,
	)
	expect(console.warn).toHaveBeenCalledTimes(1)
})

it("supports fetch options", async ({ expect, client }) => {
	await client.dangerouslyGetAll({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedContentAPI({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.dangerouslyGetAll({ fetchOptions: { headers: { foo: "bar" } } })
	expect(client).toHaveLastFetchedContentAPI(
		{},
		{ cache: "no-cache", headers: { foo: "bar" } },
	)
})

it("supports signal", async ({ expect, client }) => {
	await expect(() =>
		client.dangerouslyGetAll({ fetchOptions: { signal: AbortSignal.abort() } }),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.dangerouslyGetAll(),
		client.dangerouslyGetAll(),
		client.dangerouslyGetAll({ signal: controller1.signal }),
		client.dangerouslyGetAll({ signal: controller1.signal }),
		client.dangerouslyGetAll({ signal: controller2.signal }),
		client.dangerouslyGetAll({ signal: controller2.signal }),
	])
	await client.dangerouslyGetAll()
	expect(client).toHaveFetchedRepoTimes(3)
	expect(client).toHaveFetchedContentAPITimes(4)
})
