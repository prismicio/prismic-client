import { describe, vi } from "vitest"

import type { Fixtures } from "./it"
import { it } from "./it"

import type { Client } from "../src"
import { RefNotFoundError, createClient } from "../src"

it("throws if repositoryName is accessed but unavailable", async ({
	expect,
}) => {
	const client = createClient("https://example.com/custom")
	expect(() => client.repositoryName).toThrow(/prefer-repository-name/i)
})

type QueryCase = {
	name: keyof Client
	fn: (
		args: Pick<Fixtures, "client" | "docs">,
		params?: Parameters<Client["get"]>[0],
	) => unknown
}

const queryCases: QueryCase[] = [
	{
		name: "get",
		fn: ({ client }, params) => client.get(params),
	},
	{
		name: "getFirst",
		fn: ({ client }, params) => client.getFirst(params),
	},
	{
		name: "getByID",
		fn: ({ client, docs }, params) => client.getByID(docs.default.id, params),
	},
	{
		name: "getByIDs",
		fn: ({ client, docs }, params) =>
			client.getByIDs([docs.default.id, docs.default2.id], params),
	},
	{
		name: "getByUID",
		fn: ({ client, docs }, params) =>
			client.getByUID(docs.default.type, docs.default.uid, params),
	},
	{
		name: "getByUIDs",
		fn: ({ client, docs }, params) =>
			client.getByUIDs(
				docs.default.type,
				[docs.default.uid, docs.default2.uid],
				params,
			),
	},
	{
		name: "getAllByIDs",
		fn: ({ client, docs }, params) =>
			client.getAllByIDs([docs.default.id, docs.default2.id], params),
	},
	{
		name: "getAllByUIDs",
		fn: ({ client, docs }, params) =>
			client.getAllByUIDs(
				docs.default.type,
				[docs.default.uid, docs.default2.uid],
				params,
			),
	},
	{
		name: "getByType",
		fn: ({ client, docs }, params) =>
			client.getByType(docs.default.type, params),
	},
	{
		name: "getAllByType",
		fn: ({ client, docs }, params) =>
			client.getAllByType(docs.default.type, params),
	},
	{
		name: "getSingle",
		fn: ({ client, docs }, params) =>
			client.getSingle(docs.defaultSingle.type, params),
	},
	{
		name: "getByTag",
		fn: ({ client, docs }, params) =>
			client.getByTag(docs.default.tags[0], params),
	},
	{
		name: "getAllByTag",
		fn: ({ client, docs }, params) =>
			client.getAllByTag(docs.default.tags[0], params),
	},
	{
		name: "getBySomeTags",
		fn: ({ client, docs }, params) =>
			client.getBySomeTags(
				[docs.default.tags[0], docs.default2.tags[0]],
				params,
			),
	},
	{
		name: "getAllBySomeTags",
		fn: ({ client, docs }, params) =>
			client.getAllBySomeTags(
				[docs.default.tags[0], docs.default2.tags[0]],
				params,
			),
	},
	{
		name: "getByEveryTag",
		fn: ({ client, docs }, params) =>
			client.getByEveryTag(
				[docs.default.tags[0], docs.default2.tags[0]],
				params,
			),
	},
	{
		name: "getAllByEveryTag",
		fn: ({ client, docs }, params) =>
			client.getAllByEveryTag(
				[docs.default.tags[0], docs.default2.tags[0]],
				params,
			),
	},
	{
		name: "dangerouslyGetAll",
		fn: ({ client }, params) => client.dangerouslyGetAll(params),
	},
]

describe.for(queryCases)("$name", async ({ fn }) => {
	it("supports params", async ({ expect, client, docs }) => {
		await fn({ client, docs }, { after: "foo", routes: [] })
		expect(client).toHaveLastFetchedContentAPI({ after: "foo", routes: "[]" })
	})

	it("supports default params", async ({ expect, client, docs }) => {
		client.defaultParams = { after: "foo" }
		await fn({ client, docs }, { routes: [] })
		expect(client).toHaveLastFetchedContentAPI({ after: "foo", routes: "[]" })
	})

	it("uses cached repository metadata within the client's repository cache TTL", async ({
		expect,
		client,
		docs,
	}) => {
		vi.useFakeTimers()
		await fn({ client, docs })
		await fn({ client, docs })
		vi.advanceTimersByTime(5000)
		await fn({ client, docs })
		expect(client).toHaveFetchedRepoTimes(2)
		vi.useRealTimers()
	})

	it("retries with the master ref when an invalid ref is used", async ({
		expect,
		client,
		docs,
		response,
	}) => {
		vi.mocked(client.fetchFn).mockResolvedValueOnce(
			response.repository("invalid"),
		)
		await fn({ client, docs })
		expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
		expect(client).not.toHaveLastFetchedContentAPI({ ref: "invalid" })
	})

	it("throws if the maximum number of retries with invalid refs is reached", async ({
		expect,
		client,
		docs,
		response,
	}) => {
		vi.mocked(client.fetchFn)
			.mockResolvedValueOnce(response.repository("invalid"))
			.mockResolvedValueOnce(response.refNotFound("invalid"))
			.mockResolvedValueOnce(response.repository("invalid"))
			.mockResolvedValueOnce(response.refNotFound("invalid"))
		await expect(() => fn({ client, docs })).rejects.toThrow(RefNotFoundError)
	})

	it("fetches a new master ref on subsequent queries if an invalid ref is used", async ({
		expect,
		client,
		docs,
		response,
	}) => {
		vi.mocked(client.fetchFn).mockResolvedValueOnce(
			response.repository("invalid"),
		)
		await fn({ client, docs })
		expect(client).toHaveFetchedContentAPI({ ref: "invalid" })
		expect(client).not.toHaveLastFetchedContentAPI({ ref: "invalid" })
		await fn({ client, docs })
		expect(client).not.toHaveLastFetchedContentAPI({ ref: "invalid" })
		expect(client).toHaveFetchedRepoTimes(2)
	})

	it("retries with the master ref when an expired ref is used", async ({
		expect,
		client,
		docs,
		response,
	}) => {
		vi.mocked(client.fetchFn).mockResolvedValueOnce(
			response.repository("expired"),
		)
		await fn({ client, docs })
		expect(client).toHaveFetchedContentAPI({ ref: "expired" })
		expect(client).not.toHaveLastFetchedContentAPI({ ref: "expired" })
	})

	it("throttles invalid ref logs", async ({
		expect,
		client,
		docs,

		response,
	}) => {
		vi.mocked(client.fetchFn)
			.mockResolvedValueOnce(response.repository("invalid"))
			.mockResolvedValueOnce(response.refNotFound("invalid"))
			.mockResolvedValueOnce(response.repository("invalid"))
			.mockResolvedValue(response.refNotFound("invalid"))
		await expect(() => fn({ client, docs })).rejects.toThrow(RefNotFoundError)
		expect(console.warn).toHaveBeenCalledTimes(1)
	})

	it("supports fetch options", async ({ expect, client, docs }) => {
		await fn({ client, docs }, { fetchOptions: { cache: "no-cache" } })
		expect(client).toHaveLastFetchedContentAPI({}, { cache: "no-cache" })
	})

	it("supports default fetch options", async ({ expect, client, docs }) => {
		client.fetchOptions = { cache: "no-cache" }
		await fn({ client, docs }, { fetchOptions: { headers: { foo: "bar" } } })
		expect(client).toHaveLastFetchedContentAPI(
			{},
			{ cache: "no-cache", headers: { foo: "bar" } },
		)
	})

	it("supports signal", async ({ expect, client, docs }) => {
		await expect(() =>
			fn({ client, docs }, { fetchOptions: { signal: AbortSignal.abort() } }),
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
			fn({ client, docs }),
			fn({ client, docs }),
			fn({ client, docs }, { fetchOptions: { signal: controller1.signal } }),
			fn({ client, docs }, { fetchOptions: { signal: controller1.signal } }),
			fn({ client, docs }, { fetchOptions: { signal: controller2.signal } }),
			fn({ client, docs }, { fetchOptions: { signal: controller2.signal } }),
		])
		await fn({ client, docs })
		expect(client).toHaveFetchedRepoTimes(3)
		expect(client).toHaveFetchedContentAPITimes(4)
	})
})

type MetadataCase = {
	name: keyof Client
	fn: (
		args: Pick<Fixtures, "client" | "accessToken" | "docs" | "release">,
		params?: Parameters<Client["get"]>[0],
	) => unknown
}

const metadataCases: MetadataCase[] = [
	{
		name: "getMasterRef",
		fn: ({ client }, params) => client.getMasterRef(params),
	},
	{
		name: "getRefByID",
		fn: ({ client, release, accessToken }, params) => {
			client.accessToken = accessToken

			return client.getRefByID(release.id, params)
		},
	},
	{
		name: "getRefByLabel",
		fn: ({ client, release, accessToken }, params) => {
			client.accessToken = accessToken

			return client.getRefByLabel(release.label, params)
		},
	},
	{
		name: "getRefs",
		fn: ({ client }, params) => client.getRefs(params),
	},
	{
		name: "getReleaseByID",
		fn: ({ client, release, accessToken }, params) => {
			client.accessToken = accessToken

			return client.getReleaseByID(release.id, params)
		},
	},
	{
		name: "getReleaseByLabel",
		fn: ({ client, release, accessToken }, params) => {
			client.accessToken = accessToken

			return client.getReleaseByLabel(release.label, params)
		},
	},
	{
		name: "getReleases",
		fn: ({ client, accessToken }, params) => {
			client.accessToken = accessToken

			return client.getReleases(params)
		},
	},
	{
		name: "getTags",
		fn: ({ client }, params) => client.getTags(params),
	},
	{
		name: "getRepository",
		fn: ({ client }, params) => client.getRepository(params),
	},
	{
		name: "buildQueryURL",
		fn: ({ client }, params) => client.buildQueryURL(params),
	},
	{
		name: "resolvePreviewURL",
		fn: ({ client, docs }, params) =>
			client.resolvePreviewURL({
				documentID: docs.default.id,
				previewToken: "abc",
				defaultURL: "/default",
				...params,
			}),
	},
]

describe.for(metadataCases)("$name", async ({ fn }) => {
	it("supports fetch options", async ({
		expect,
		client,
		accessToken,
		docs,
		release,
	}) => {
		await fn(
			{ client, accessToken, docs, release },
			{ fetchOptions: { cache: "no-cache" } },
		)
		expect(client.fetchFn).toHaveBeenLastCalledWith(
			expect.anything(),
			expect.objectContaining({ cache: "no-cache" }),
		)
	})

	it("supports default fetch options", async ({
		expect,
		client,
		accessToken,
		docs,
		release,
	}) => {
		client.fetchOptions = { cache: "no-cache" }
		await fn(
			{ client, accessToken, docs, release },
			{ fetchOptions: { headers: { foo: "bar" } } },
		)
		expect(client.fetchFn).toHaveBeenLastCalledWith(
			expect.anything(),
			expect.objectContaining({ cache: "no-cache", headers: { foo: "bar" } }),
		)
	})

	it("supports signal", async ({
		expect,
		client,
		accessToken,
		docs,
		release,
	}) => {
		await expect(() =>
			fn(
				{ client, accessToken, docs, release },
				{ fetchOptions: { signal: AbortSignal.abort() } },
			),
		).rejects.toThrow("aborted")
	})
})
