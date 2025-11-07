import { vi } from "vitest"

import { it } from "./it"

import { NotFoundError } from "../src"

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
