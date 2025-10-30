import { vi } from "vitest"

import { it } from "./it"

import { RefNotFoundError } from "../src"

it("returns multiple documents", async ({ expect, client, docs }) => {
	const res = await client.getAllByType(docs.default.type)
	expect(res.length).toBeGreaterThan(1)
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default2.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default3.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default4.id }))
})

it("can be limited", async ({ expect, client, docs }) => {
	const res = await client.getAllByType(docs.default.type, { limit: 1 })
	expect(res).toHaveLength(1)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getAllByType(docs.default.type)
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[at(document.type, "${docs.default.type}")]]`,
	})
})

it("uses a default page size", async ({ expect, client, docs }) => {
	await client.getAllByType(docs.default.type)
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})

it("supports params", async ({ expect, client, docs }) => {
	await client.getAllByType(docs.default.type, {
		lang: "fr-fr",
		routes: [],
	})
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
})

it("supports default params", async ({ expect, client, docs }) => {
	client.defaultParams = { lang: "fr-fr" }
	await client.getAllByType(docs.default.type, { routes: [] })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
})

it("uses cached repository metadata within the client's repository cache TTL", async ({
	expect,
	client,
	docs,
}) => {
	vi.useFakeTimers()
	await client.getAllByType(docs.default.type)
	await client.getAllByType(docs.default.type)
	vi.advanceTimersByTime(5000)
	await client.getAllByType(docs.default.type)
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("retries with the master ref when an invalid ref is used", async ({
	expect,
	client,
	docs,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValueOnce(response.refNotFound(masterRef))
	await client.getAllByType(docs.default.type)
	expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(1)
})

it("throws if the maximum number of retries with invalid refs is reached", async ({
	expect,
	client,
	docs,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValue(response.refNotFound("invalid"))
	await expect(() => client.getAllByType(docs.default.type)).rejects.toThrow(
		RefNotFoundError,
	)
	expect(client).toHaveFetchedContentAPITimes(3)
})

it("fetches a new master ref on subsequent queries if an invalid ref is used", async ({
	expect,
	client,
	docs,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValueOnce(response.refNotFound(masterRef))
	await client.getAllByType(docs.default.type)
	expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	await client.getAllByType(docs.default.type)
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(2)
})

it("retries with the master ref when an expired ref is used", async ({
	expect,
	client,
	docs,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("expired"))
		.mockResolvedValueOnce(response.refExpired(masterRef))
	await client.getAllByType(docs.default.type)
	expect(client).toHaveFetchedContentAPI({ ref: "expired" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(1)
})

it("throttles invalid ref logs", async ({ expect, client, docs, response }) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValue(response.refNotFound("invalid"))
	await expect(() => client.getAllByType(docs.default.type)).rejects.toThrow(
		RefNotFoundError,
	)
	expect(console.warn).toHaveBeenCalledTimes(1)
})

it("supports fetch options", async ({ expect, client, docs }) => {
	await client.getAllByType(docs.default.type, {
		fetchOptions: { cache: "no-cache" },
	})
	expect(client).toHaveLastFetchedContentAPI({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client, docs }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getAllByType(docs.default.type, {
		fetchOptions: { headers: { foo: "bar" } },
	})
	expect(client).toHaveLastFetchedContentAPI(
		{},
		{ cache: "no-cache", headers: { foo: "bar" } },
	)
})

it("supports signal", async ({ expect, client, docs }) => {
	await expect(() =>
		client.getAllByType(docs.default.type, {
			fetchOptions: { signal: AbortSignal.abort() },
		}),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
	docs,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getAllByType(docs.default.type),
		client.getAllByType(docs.default.type),
		client.getAllByType(docs.default.type, { signal: controller1.signal }),
		client.getAllByType(docs.default.type, { signal: controller1.signal }),
		client.getAllByType(docs.default.type, { signal: controller2.signal }),
		client.getAllByType(docs.default.type, { signal: controller2.signal }),
	])
	await client.getAllByType(docs.default.type)
	expect(client).toHaveFetchedRepoTimes(3)
	expect(client).toHaveFetchedContentAPITimes(4)
})
