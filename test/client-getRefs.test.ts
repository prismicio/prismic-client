import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient.ts"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2.ts"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod.ts"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod.ts"
import { testFetchOptions } from "./__testutils__/testFetchOptions.ts"

it("returns all refs", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.getRefs()

	expect(res).toStrictEqual(repositoryResponse.refs)
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getRefs(params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getRefs(params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getRefs(params),
	mode: "repository",
})
