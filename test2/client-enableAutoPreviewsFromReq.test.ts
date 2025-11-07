import { vi } from "vitest"

import { it } from "./it"

it("uses preview ref from server request", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repository(masterRef))
		.mockResolvedValueOnce(response.search([]))
	client.enableAutoPreviewsFromReq({
		headers: { cookie: `io.prismic.preview=foo` },
	})
	await client.get()
	expect(client).toHaveLastFetchedContentAPI({ ref: "foo" })
})

it("uses preview ref from Request", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repository(masterRef))
		.mockResolvedValueOnce(response.search([]))
	client.enableAutoPreviewsFromReq(
		new Request("https://example.com/preview", {
			headers: { cookie: "io.prismic.preview=foo" },
		}),
	)
	await client.get()
	expect(client).toHaveLastFetchedContentAPI({ ref: "foo" })
})

it("falls back to master ref without preview cookie", async ({
	expect,
	client,
	masterRef,
	response,
}) => {
	vi.mocked(client.fetchFn)
		.mockResolvedValueOnce(response.repository(masterRef))
		.mockResolvedValueOnce(response.search([]))
	client.enableAutoPreviewsFromReq({ headers: { cookie: "" } })
	await client.get()
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
})
