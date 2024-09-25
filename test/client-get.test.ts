import { expect, it, vi } from "vitest"

import fetch from "node-fetch"

import { createTestClient } from "./__testutils__/createClient"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetMethod } from "./__testutils__/testAnyGetMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetMethod("resolves a query", {
	run: (client) => client.get(),
})

testGetMethod("includes params if provided", {
	run: (client) =>
		client.get({
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	},
})

testGetMethod("includes default params if provided", {
	run: (client) => client.get(),
	clientConfig: {
		defaultParams: {
			lang: "*",
		},
	},
	requiredParams: {
		lang: "*",
	},
})

testGetMethod("merges params and default params if provided", {
	run: (client) =>
		client.get({
			accessToken: "overridden-accessToken",
			ref: "overridden-ref",
			lang: "fr-fr",
		}),
	clientConfig: {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: {
			lang: "*",
		},
	},
	requiredParams: {
		access_token: "overridden-accessToken",
		ref: "overridden-ref",
		lang: "fr-fr",
	},
})

it("uses cached repository metadata within the client's repository cache TTL", async (ctx) => {
	const fetchSpy = vi.fn(fetch)

	const client = createTestClient({ clientConfig: { fetch: fetchSpy }, ctx })

	const repositoryResponse1 = ctx.mock.api.repository()
	repositoryResponse1.refs = [ctx.mock.api.ref({ isMasterRef: true })]
	mockPrismicRestAPIV2({ ctx, repositoryResponse: repositoryResponse1 })

	await client.get()

	// This response response will not be used.
	const repositoryResponse2 = ctx.mock.api.repository()
	repositoryResponse2.refs = [ctx.mock.api.ref({ isMasterRef: true })]
	mockPrismicRestAPIV2({ ctx, repositoryResponse: repositoryResponse2 })

	await client.get()

	const getRequests = fetchSpy.mock.calls
		.filter(
			(call) =>
				new URL(call[0] as string).pathname === "/api/v2/documents/search",
		)
		.map((call) => call[0] as string)

	expect(new URL(getRequests[0]).searchParams.get("ref")).toBe(
		repositoryResponse1.refs[0].ref,
	)
	expect(new URL(getRequests[1]).searchParams.get("ref")).toBe(
		repositoryResponse1.refs[0].ref,
	)
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.get(params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.get(params),
})
