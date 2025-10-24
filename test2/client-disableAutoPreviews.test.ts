import { vi } from "vitest"

import { it } from "./it"

it("ignores browser preview cookie when disabled", async ({
	expect,
	client,
}) => {
	vi.stubGlobal("document", { cookie: `io.prismic.preview=foo` })
	client.disableAutoPreviews()
	await client.get()
	expect(client).not.toHaveFetchedContentAPI({ ref: "foo" })
	vi.unstubAllGlobals()
})

it("ignores server request preview cookie when disabled", async ({
	expect,
	client,
}) => {
	client.enableAutoPreviewsFromReq({
		headers: { cookie: `io.prismic.preview=foo` },
	})
	client.disableAutoPreviews()
	await client.get()
	expect(client).not.toHaveFetchedContentAPI({ ref: "foo" })
})

it("ignores Request preview cookie when disabled", async ({
	expect,
	client,
}) => {
	client.enableAutoPreviewsFromReq(
		new Request("https://example.com/preview", {
			headers: { cookie: `io.prismic.preview=foo` },
		}),
	)
	client.disableAutoPreviews()
	await client.get()
	expect(client).not.toHaveFetchedContentAPI({ ref: "foo" })
})
