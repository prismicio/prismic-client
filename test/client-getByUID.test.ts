import { vi } from "vitest"

import { it } from "./it"

import { NotFoundError } from "../src"

it("returns single document", async ({ expect, client, docs }) => {
	const res = await client.getByUID(docs.default.type, docs.default.uid)
	expect(res).toMatchObject({ uid: docs.default.uid })
})

it("throws if no document is returned", async ({
	expect,
	client,
	docs,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockImplementationOnce(fetch)
		.mockResolvedValueOnce(response.search([]))
	await expect(() =>
		client.getByUID(docs.default.type, "invalid"),
	).rejects.toThrow(NotFoundError)
})

it("includes filter", async ({ expect, client, docs }) => {
	await client.getByUID(docs.default.type, docs.default.uid)
	const params = new URLSearchParams()
	params.append("q", `[[at(document.type, "${docs.default.type}")]]`)
	params.append(
		"q",
		`[[at(my.${docs.default.type}.uid, "${docs.default.uid}")]]`,
	)
	expect(client).toHaveLastFetchedContentAPI(params)
})
