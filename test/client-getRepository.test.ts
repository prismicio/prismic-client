import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient.ts"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2.ts"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod.ts"
import { testFetchOptions } from "./__testutils__/testFetchOptions.ts"

import type * as prismic from "../src/index.ts"

it("returns repository metadata", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.getRepository()

	expect(res).toStrictEqual(repositoryResponse)
})

// TODO: Remove when Authorization header support works in browsers with CORS.
it("includes access token if configured", async (ctx) => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "accessToken",
	}

	const repositoryResponse = ctx.mock.api.repository()
	mockPrismicRestAPIV2({
		repositoryResponse,
		accessToken: clientConfig.accessToken,
		ctx,
	})

	const client = createTestClient({ clientConfig, ctx })
	const res = await client.getRepository()

	expect(res).toStrictEqual(repositoryResponse)
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getRepository(params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getRepository(params),
})
