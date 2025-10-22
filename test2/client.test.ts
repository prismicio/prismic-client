import { it } from "./it"

import { createClient } from "../src"

it("throws if repositoryName is accessed but unavailable", async ({
	expect,
}) => {
	const client = createClient("https://example.com/custom")
	expect(() => client.repositoryName).toThrow(/prefer-repository-name/i)
})

// TODO: Remove when alias gets removed
it("aliases endpoint to documentAPIEndpoint", async ({ expect, client }) => {
	expect(client.endpoint).toBe(client.documentAPIEndpoint)
	client.endpoint = "https://example.com/custom"
	expect(client.documentAPIEndpoint).toBe("https://example.com/custom")
})

// describe.for([["get"], ["getFirst"]] as const)("%s", ([method]) => {
// 	it("supports params", async ({ expect, client }) => {
// 		await client[method]({ lang: "fr-fr", routes: [] })
// 		expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
// 	})
//
// 	it("supports default params", async ({ expect, client }) => {
// 		client.defaultParams = { lang: "fr-fr" }
// 		await client[method]({ routes: [] })
// 		expect(client).toHaveLastFetchedContentAPI({ lang: "fr-fr", routes: "[]" })
// 	})
//
// 	it("uses cached repository metadata within the client's repository cache TTL", async ({
// 		expect,
// 		client,
// 	}) => {
// 		vi.useFakeTimers()
// 		await client.getFirst()
// 		await client.getFirst()
// 		vi.advanceTimersByTime(5000)
// 		await client.getFirst()
// 		expect(client).toHaveFetchedRepoTimes(2)
// 		vi.useRealTimers()
// 	})
//
// 	it("retries with the master ref when an invalid ref is used", async ({
// 		expect,
// 		client,
// 		masterRef,
// 		response,
// 	}) => {
// 		vi.mocked(client.fetchFn)
// 			.mockResolvedValueOnce(response.repo("invalid"))
// 			.mockResolvedValueOnce(response.refNotFound(masterRef))
// 		await client.getFirst()
// 		expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
// 		expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
// 		expect(client).toHaveFetchedRepoTimes(1)
// 	})
//
// 	it("throws if the maximum number of retries with invalid refs is reached", async ({
// 		expect,
// 		client,
// 		response,
// 	}) => {
// 		vi.mocked(client.fetchFn)
// 			.mockResolvedValueOnce(response.repo("invalid"))
// 			.mockResolvedValue(response.refNotFound("invalid"))
// 		await expect(() => client.getFirst()).rejects.toThrow(RefNotFoundError)
// 		expect(client).toHaveFetchedContentAPITimes(3)
// 	})
//
// 	it("fetches a new master ref on subsequent queries if an invalid ref is used", async ({
// 		expect,
// 		client,
// 		masterRef,
// 		response,
// 	}) => {
// 		vi.mocked(client.fetchFn)
// 			.mockResolvedValueOnce(response.repo("invalid"))
// 			.mockResolvedValueOnce(response.refNotFound(masterRef))
// 		await client.getFirst()
// 		expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
// 		expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
// 		await client.getFirst()
// 		expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
// 		expect(client).toHaveFetchedRepoTimes(2)
// 	})
//
// 	it("retries with the master ref when an expired ref is used", async ({
// 		expect,
// 		client,
// 		masterRef,
// 		response,
// 	}) => {
// 		vi.mocked(client.fetchFn)
// 			.mockResolvedValueOnce(response.repo("expired"))
// 			.mockResolvedValueOnce(response.refExpired(masterRef))
// 		await client.getFirst()
// 		expect(client).toHaveFetchedContentAPI({ ref: "expired" })
// 		expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
// 		expect(client).toHaveFetchedRepoTimes(1)
// 	})
//
// 	it("throttles invalid ref logs", async ({ expect, client, response }) => {
// 		vi.mocked(client.fetchFn)
// 			.mockResolvedValueOnce(response.repo("invalid"))
// 			.mockResolvedValue(response.refNotFound("invalid"))
// 		await expect(() => client.getFirst()).rejects.toThrow(RefNotFoundError)
// 		expect(console.warn).toHaveBeenCalledTimes(1)
// 	})
//
// 	it("supports fetch options", async ({ expect, client }) => {
// 		await client.getFirst({ fetchOptions: { cache: "no-cache" } })
// 		expect(client).toHaveLastFetchedContentAPI({}, { cache: "no-cache" })
// 	})
//
// 	it("supports default fetch options", async ({ expect, client }) => {
// 		client.fetchOptions = { cache: "no-cache" }
// 		await client.getFirst({ fetchOptions: { headers: { foo: "bar" } } })
// 		expect(client).toHaveLastFetchedContentAPI(
// 			{},
// 			{ cache: "no-cache", headers: { foo: "bar" } },
// 		)
// 	})
//
// 	it("supports signal", async ({ expect, client }) => {
// 		await expect(() =>
// 			client.getFirst({ fetchOptions: { signal: AbortSignal.abort() } }),
// 		).rejects.toThrow("aborted")
// 	})
//
// 	it("shares concurrent equivalent network requests", async ({
// 		expect,
// 		client,
// 	}) => {
// 		const controller1 = new AbortController()
// 		const controller2 = new AbortController()
// 		await Promise.all([
// 			client.getFirst(),
// 			client.getFirst(),
// 			client.getFirst({ signal: controller1.signal }),
// 			client.getFirst({ signal: controller1.signal }),
// 			client.getFirst({ signal: controller2.signal }),
// 			client.getFirst({ signal: controller2.signal }),
// 		])
// 		await client.getFirst()
// 		expect(client).toHaveFetchedRepoTimes(3)
// 		expect(client).toHaveFetchedContentAPITimes(4)
// 	})
// })
