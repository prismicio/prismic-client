import { vi } from "vitest"

import { it } from "./it"

it("resolves a preview URL in the browser", async ({
	expect,
	client,
	docs,
}) => {
	vi.stubGlobal("location", {
		search: `?documentId=${docs.default.id}&token=abc`,
	})
	const res = await client.resolvePreviewURL({ defaultURL: "/failed" })
	expect(res).toBe(`/${docs.default.uid}`)
	expect(client).toHaveFetchedContentAPI({ ref: "abc" })
	vi.unstubAllGlobals()
})

it("resolves a preview URL using a server req", async ({
	expect,
	client,
	docs,
}) => {
	client.enableAutoPreviewsFromReq({
		query: { documentId: docs.default.id, token: "abc" },
		url: `/preview?documentId=${docs.default.id}&token=abc`,
	})
	const res = await client.resolvePreviewURL({ defaultURL: "/failed" })
	expect(res).toBe(`/${docs.default.uid}`)
	expect(client).toHaveFetchedContentAPI({ ref: "abc" })
})

it("resolves a preview URL using a Request", async ({
	expect,
	client,
	docs,
}) => {
	const url = `https://example.com/preview?documentId=${docs.default.id}&token=abc`
	client.enableAutoPreviewsFromReq(new Request(url))
	const res = await client.resolvePreviewURL({ defaultURL: "/failed" })
	expect(res).toBe(`/${docs.default.uid}`)
	expect(client).toHaveFetchedContentAPI({ ref: "abc" })
})

it("resolves a preview URL using a Request without a URL host", async ({
	expect,
	client,
	docs,
}) => {
	// We need to estimate a Request since this is an invalid URL
	client.enableAutoPreviewsFromReq({
		url: `/preview?documentId=${docs.default.id}&token=abc`,
		headers: new Headers(),
	})
	const res = await client.resolvePreviewURL({ defaultURL: "/failed" })
	expect(res).toBe(`/${docs.default.uid}`)
	expect(client).toHaveFetchedContentAPI({ ref: "abc" })
})

it("supports an explicit document ID and token", async ({
	expect,
	client,
	docs,
}) => {
	const res = await client.resolvePreviewURL({
		documentID: docs.default.id,
		previewToken: "abc",
		defaultURL: "/failed",
	})
	expect(res).toBe(`/${docs.default.uid}`)
	expect(client).toHaveFetchedContentAPI({ ref: "abc" })
})

it("returns the default URL when the browser is not in a preview session", async ({
	expect,
	client,
}) => {
	vi.stubGlobal("location", { search: "" })
	const res = await client.resolvePreviewURL({ defaultURL: "/default" })
	expect(res).toBe("/default")
	vi.unstubAllGlobals()
})

it("returns the default URL when the server req is not in a preview session", async ({
	expect,
	client,
}) => {
	client.enableAutoPreviewsFromReq({})
	const res = await client.resolvePreviewURL({ defaultURL: "/default" })
	expect(res).toBe("/default")
})

it("returns the default URL when the Request is not in a preview session", async ({
	expect,
	client,
}) => {
	client.enableAutoPreviewsFromReq(new Request("https://example.com/preview"))
	const res = await client.resolvePreviewURL({ defaultURL: "/default" })
	expect(res).toBe("/default")
})

it("returns the default URL if no preview context is available", async ({
	expect,
	client,
}) => {
	const res = await client.resolvePreviewURL({ defaultURL: "/default" })
	expect(res).toBe("/default")
})

it("returns the default URL if the previewed document doesn't have a URL", async ({
	expect,
	client,
	docs,
}) => {
	client.routes = []
	const res = await client.resolvePreviewURL({
		documentID: docs.default.id,
		previewToken: "abc",
		defaultURL: "/default",
	})
	expect(res).toBe("/default")
})

it("supports link resolver", async ({ expect, client, docs }) => {
	const res = await client.resolvePreviewURL({
		documentID: docs.default.id,
		previewToken: "abc",
		linkResolver: () => "/resolved",
		defaultURL: "/default",
	})
	expect(res).toBe("/resolved")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
	masterRef,
	docs,
}) => {
	const url = `https://example.com/preview?documentId=${docs.default.id}&token=${masterRef}`
	client.enableAutoPreviewsFromReq(new Request(url))
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.resolvePreviewURL({ defaultURL: "/default" }),
		client.resolvePreviewURL({ defaultURL: "/default" }),
		client.resolvePreviewURL({
			defaultURL: "/default",
			signal: controller1.signal,
		}),
		client.resolvePreviewURL({
			defaultURL: "/default",
			signal: controller1.signal,
		}),
		client.resolvePreviewURL({
			defaultURL: "/default",
			signal: controller2.signal,
		}),
		client.resolvePreviewURL({
			defaultURL: "/default",
			signal: controller2.signal,
		}),
	])
	await client.resolvePreviewURL({ defaultURL: "/default" })
	expect(client).toHaveFetchedRepoTimes(3)
	expect(client).toHaveFetchedContentAPITimes(4)
})
