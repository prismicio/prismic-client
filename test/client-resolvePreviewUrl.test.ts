import { expect, it } from "vitest"

import * as prismicM from "@prismicio/mock"
import { Headers } from "node-fetch"

import { createTestClient } from "./__testutils__/createClient"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

const previewToken = "previewToken"

it("resolves a preview url in the browser", async (ctx) => {
	const seed = ctx.task.name
	const document = { ...prismicM.value.document({ seed }), uid: seed }
	const queryResponse = prismicM.api.query({ seed, documents: [document] })

	globalThis.location = {
		...globalThis.location,
		search: `?documentId=${document.id}&token=${previewToken}`,
	}

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
	})

	expect(res).toBe(`/${document.uid}`)

	// @ts-expect-error - Need to reset back to Node.js's default globalThis without `location`
	globalThis.location = undefined
})

it("resolves a preview url using a server req object", async (ctx) => {
	const seed = ctx.task.name
	const document = { ...prismicM.value.document({ seed }), uid: seed }
	const queryResponse = prismicM.api.query({ seed, documents: [document] })

	const req = {
		query: { documentId: document.id, token: previewToken },
		// This `url` property simulates a Next.js request. It is a
		// partial URL only containing the pathname + search params.
		url: `/foo?bar=baz`,
	}

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	})

	const client = createTestClient({ ctx })
	client.enableAutoPreviewsFromReq(req)
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
	})

	expect(res).toBe(`/${document.uid}`)
})

it("resolves a preview url using a Web API-based server req object", async (ctx) => {
	const seed = ctx.task.name
	const document = { ...prismicM.value.document({ seed }), uid: seed }
	const queryResponse = prismicM.api.query({ seed, documents: [document] })

	const headers = new Headers()
	const url = new URL("https://example.com")
	url.searchParams.set("documentId", document.id)
	url.searchParams.set("token", previewToken)
	const req = {
		headers,
		url: url.toString(),
	}

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	})

	const client = createTestClient({ ctx })
	client.enableAutoPreviewsFromReq(req)
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
	})

	expect(res).toBe(`/${document.uid}`)
})

it("resolves a preview url using a Web API-based server req object containing a URL without a host", async (ctx) => {
	const seed = ctx.task.name
	const document = { ...prismicM.value.document({ seed }), uid: seed }
	const queryResponse = prismicM.api.query({ seed, documents: [document] })

	const headers = new Headers()
	const url = `/foo?documentId=${document.id}&token=${previewToken}`
	const req = {
		headers,
		url: url.toString(),
	}

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	})

	const client = createTestClient({ ctx })
	client.enableAutoPreviewsFromReq(req)
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
	})

	expect(res).toBe(`/${document.uid}`)
})

it("allows providing an explicit documentId and previewToken", async (ctx) => {
	const seed = ctx.task.name
	const document = { ...prismicM.value.document({ seed }), uid: seed }
	const queryResponse = prismicM.api.query({ seed, documents: [document] })

	const req = {
		query: {
			documentId: "this will not be used",
			token: "this will not be used",
		},
	}

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	})

	const client = createTestClient({ ctx })
	client.enableAutoPreviewsFromReq(req)
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
		documentID: document.id,
		previewToken,
	})

	expect(res).toBe(`/${document.uid}`)
})

it("returns defaultURL if current url does not contain preview params in browser", async (ctx) => {
	const defaultURL = "defaultURL"

	// Set a global Location object without the parameters we need for automatic
	// preview support.
	globalThis.location = { ...globalThis.location, search: "" }

	const client = createTestClient({ ctx })
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL,
	})

	expect(res).toBe(defaultURL)

	// @ts-expect-error - Need to reset back to Node.js's default globalThis without `location`
	globalThis.location = undefined
})

it("returns defaultURL if req does not contain preview params in server req object", async (ctx) => {
	const defaultURL = "defaultURL"
	const req = {}

	const client = createTestClient({ ctx })
	client.enableAutoPreviewsFromReq(req)
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL,
	})

	expect(res).toBe(defaultURL)
})

it("returns defaultURL if no preview context is available", async (ctx) => {
	const defaultURL = "defaultURL"

	const client = createTestClient({ ctx })
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL,
	})

	expect(res).toBe(defaultURL)
})

it("returns defaultURL if resolved URL is not a string", async (ctx) => {
	const seed = ctx.task.name
	const document = {
		...prismicM.value.document({ seed, withURL: false }),
		uid: seed,
	}
	const queryResponse = prismicM.api.query({ seed, documents: [document] })
	const defaultURL = "defaultURL"

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.resolvePreviewURL({
		linkResolver: () => null,
		defaultURL,
		documentID: document.id,
		previewToken,
	})

	expect(res).toBe(defaultURL)
})

testFetchOptions("supports fetch options", {
	run: (client, params) =>
		client.resolvePreviewURL({
			...params,
			defaultURL: "defaultURL",
			documentID: "foo",
			previewToken,
		}),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) =>
		client.resolvePreviewURL({
			...params,
			defaultURL: "defaultURL",
			documentID: "foo",
			previewToken,
		}),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) =>
		client.resolvePreviewURL({
			...params,
			defaultURL: "defaultURL",
			documentID: "foo",
			previewToken,
		}),
	mode: "resolvePreview",
})
