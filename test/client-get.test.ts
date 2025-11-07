import { vi } from "vitest"

import { it } from "./it"

it("returns paginated response", async ({ expect, client }) => {
	const res = await client.get()
	expect(res).toMatchObject({ results: expect.any(Array) })
})

it("does not include filters by default", async ({ expect, client }) => {
	await client.get()
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).not.toHaveSearchParam("q")
})
