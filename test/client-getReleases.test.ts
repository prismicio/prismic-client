import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

it("returns all Releases", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.getReleases()

	expect(res).toStrictEqual(
		repositoryResponse.refs.filter((ref) => !ref.isMasterRef),
	)
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getReleases(params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getReleases(params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getReleases(params),
	mode: "repository",
})
