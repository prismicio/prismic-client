import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

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
