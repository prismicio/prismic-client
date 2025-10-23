import { vi } from "vitest"

import { it } from "./it"

import { RefNotFoundError } from "../src"

it("returns multiple documents", async ({ expect, client, docs }) => {
	const res = await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(res).toHaveLength(2)
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default.id }))
	expect(res).toContainEqual(expect.objectContaining({ id: docs.default2.id }))
})

it("can be limited", async ({ expect, client, docs }) => {
	const res = await client.getAllByIDs([docs.default.id, docs.default2.id], {
		limit: 1,
	})
	expect(res).toHaveLength(1)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[in(document.id, ["${docs.default.id}", "${docs.default2.id}"])]]`,
	})
})

it("uses a default page size", async ({ expect, client, docs }) => {
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveLastFetchedContentAPI({ pageSize: "100" })
})

it("supports params", async ({ expect, client, docs }) => {
	await client.getAllByIDs([docs.default.id, docs.default2.id], {
		lang: "fr-fr",
		routes: [],
	})
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
})

it("supports default params", async ({ expect, client, docs }) => {
	client.defaultParams = { lang: "fr-fr" }
	await client.getAllByIDs([docs.default.id, docs.default2.id], { routes: [] })
	expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
})

it("uses cached repository metadata within the client's repository cache TTL", async ({
	expect,
	client,
	docs,
}) => {
	vi.useFakeTimers()
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	vi.advanceTimersByTime(5000)
	await client.getAllByIDs([docs.default.id, docs.default2.id])
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
	await client.getAllByIDs([docs.default.id, docs.default2.id])
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
	await expect(() =>
		client.getAllByIDs([docs.default.id, docs.default2.id]),
	).rejects.toThrow(RefNotFoundError)
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
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	await client.getAllByIDs([docs.default.id, docs.default2.id])
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
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveFetchedContentAPI({ ref: "expired" })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	expect(client).toHaveFetchedRepoTimes(1)
})

it("throttles invalid ref logs", async ({ expect, client, docs, response }) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo("invalid"))
		.mockResolvedValue(response.refNotFound("invalid"))
	await expect(() =>
		client.getAllByIDs([docs.default.id, docs.default2.id]),
	).rejects.toThrow(RefNotFoundError)
	expect(console.warn).toHaveBeenCalledTimes(1)
})

it("supports fetch options", async ({ expect, client, docs }) => {
	await client.getAllByIDs([docs.default.id, docs.default2.id], {
		fetchOptions: { cache: "no-cache" },
	})
	expect(client).toHaveLastFetchedContentAPI({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client, docs }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getAllByIDs([docs.default.id, docs.default2.id], {
		fetchOptions: { headers: { foo: "bar" } },
	})
	expect(client).toHaveLastFetchedContentAPI(
		{},
		{ cache: "no-cache", headers: { foo: "bar" } },
	)
})

it("supports signal", async ({ expect, client, docs }) => {
	await expect(() =>
		client.getAllByIDs([docs.default.id, docs.default2.id], {
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
		client.getAllByIDs([docs.default.id, docs.default2.id]),
		client.getAllByIDs([docs.default.id, docs.default2.id]),
		client.getAllByIDs([docs.default.id, docs.default2.id], {
			signal: controller1.signal,
		}),
		client.getAllByIDs([docs.default.id, docs.default2.id], {
			signal: controller1.signal,
		}),
		client.getAllByIDs([docs.default.id, docs.default2.id], {
			signal: controller2.signal,
		}),
		client.getAllByIDs([docs.default.id, docs.default2.id], {
			signal: controller2.signal,
		}),
	])
	await client.getAllByIDs([docs.default.id, docs.default2.id])
	expect(client).toHaveFetchedRepoTimes(3)
	expect(client).toHaveFetchedContentAPITimes(4)
})
