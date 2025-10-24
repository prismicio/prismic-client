import { vi } from "vitest"

import { it } from "./it"

it("uses preview ref from browser cookie", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.stubGlobal("document", { cookie: `io.prismic.preview=foo` })
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo(masterRef))
		.mockResolvedValueOnce(response.search([]))
	client.enableAutoPreviews()
	await client.get()
	expect(client).toHaveLastFetchedContentAPI({ ref: "foo" })
	vi.unstubAllGlobals()
})

it("re-enables after being disabled", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.stubGlobal("document", { cookie: `io.prismic.preview=foo` })
	client.disableAutoPreviews()
	await client.get()
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
	client.enableAutoPreviews()
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repo(masterRef))
		.mockResolvedValueOnce(response.search([]))
	await client.get()
	expect(client).toHaveLastFetchedContentAPI({ ref: "foo" })
	vi.unstubAllGlobals()
})
