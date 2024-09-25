import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient"
import { getMasterRef } from "./__testutils__/getMasterRef"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import { version } from "../package.json"

import type * as prismic from "../src"

const xClientVersion = `js-${version}`

it("builds a query URL using the master ref", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	const ref = getMasterRef(repositoryResponse)

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.buildQueryURL()
	const url = new URL(res)

	const expectedSearchParams = new URLSearchParams({
		ref,
		"x-c": xClientVersion,
	})
	url.searchParams.delete("integrationFieldsRef")
	url.searchParams.sort()
	expectedSearchParams.sort()

	expect(url.host).toBe(new URL(client.endpoint).host)
	expect(url.pathname).toBe("/api/v2/documents/search")
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString())
})

it("includes the `x-d` param in development", async (ctx) => {
	const originalEnv = { ...process.env }
	process.env.NODE_ENV = "development"

	mockPrismicRestAPIV2({ ctx })

	const client = createTestClient({ ctx })
	const res = await client.buildQueryURL()
	const url = new URL(res)

	expect(url.searchParams.get("x-d")).toBe("1")

	process.env = originalEnv
})

it("includes params if provided", async (ctx) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	}

	mockPrismicRestAPIV2({ ctx })

	const client = createTestClient({ ctx })
	const res = await client.buildQueryURL(params)
	const url = new URL(res)

	const expectedSearchParams = new URLSearchParams({
		ref: params.ref,
		lang: params.lang?.toString() ?? "",
		// TODO: Remove when Authorization header support works in browsers with CORS.
		access_token: params.accessToken ?? "",
		"x-c": xClientVersion,
	})

	url.searchParams.delete("integrationFieldsRef")
	url.searchParams.sort()
	expectedSearchParams.sort()

	expect(url.host).toBe(new URL(client.endpoint).host)
	expect(url.pathname).toBe("/api/v2/documents/search")
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString())
})

it("includes default params if provided", async (ctx) => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" },
	}

	mockPrismicRestAPIV2({ ctx })

	const client = createTestClient({ clientConfig, ctx })
	const res = await client.buildQueryURL()
	const url = new URL(res)

	const expectedSearchParams = new URLSearchParams({
		ref: clientConfig.ref?.toString() ?? "",
		lang: clientConfig.defaultParams?.lang?.toString() ?? "",
		// TODO: Remove when Authorization header support works in browsers with CORS.
		access_token: clientConfig.accessToken ?? "",
		"x-c": xClientVersion,
	})

	url.searchParams.delete("integrationFieldsRef")
	url.searchParams.sort()
	expectedSearchParams.sort()

	expect(url.host).toBe(new URL(client.endpoint).host)
	expect(url.pathname).toBe("/api/v2/documents/search")
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString())
})

it("merges params and default params if provided", async (ctx) => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*", page: 2 },
	}
	const params: prismic.BuildQueryURLArgs = {
		ref: "overridden-ref",
	}

	mockPrismicRestAPIV2({ ctx })

	const client = createTestClient({ clientConfig, ctx })
	const res = await client.buildQueryURL(params)
	const url = new URL(res)

	const expectedSearchParams = new URLSearchParams({
		ref: params.ref,
		lang: clientConfig.defaultParams?.lang?.toString() ?? "",
		page: clientConfig.defaultParams?.page?.toString() ?? "",
		// TODO: Remove when Authorization header support works in browsers with CORS.
		access_token: clientConfig.accessToken ?? "",
		"x-c": xClientVersion,
	})

	url.searchParams.delete("integrationFieldsRef")
	url.searchParams.sort()
	expectedSearchParams.sort()

	expect(url.host).toBe(new URL(client.endpoint).host)
	expect(url.pathname).toBe("/api/v2/documents/search")
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString())
})
