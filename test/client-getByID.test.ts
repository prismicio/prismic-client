import { vi } from "vitest"

import { it } from "./it"

import { NotFoundError } from "../src"

it("returns single document", async ({ expect, client, docs }) => {
	const res = await client.getByID(docs.default.id)
	expect(res).toMatchObject({ id: docs.default.id })
})

it("throws if no document is returned", async ({
	expect,
	client,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockImplementationOnce(fetch)
		.mockResolvedValueOnce(response.search([]))
	await expect(() => client.getByID("invalid")).rejects.toThrow(NotFoundError)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getByID(docs.default.id)
	expect(client).toHaveLastFetchedContentAPI({
		q: `[[at(document.id, "${docs.default.id}")]]`,
	})
})
