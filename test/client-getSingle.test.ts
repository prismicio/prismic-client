import { vi } from "vitest"

import { it } from "./it"

import { NotFoundError } from "../src"

it("returns single document", async ({ expect, client, docs }) => {
	const res = await client.getSingle(docs.defaultSingle.type)
	expect(res).toMatchObject({ type: docs.defaultSingle.type })
})

it("throws if no document is returned", async ({
	expect,
	client,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockImplementationOnce(fetch)
		.mockResolvedValueOnce(response.search([]))
	await expect(() => client.getSingle("invalid")).rejects.toThrow(NotFoundError)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getSingle(docs.defaultSingle.type)
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[at(document.type, "${docs.defaultSingle.type}")]]`,
	})
})
