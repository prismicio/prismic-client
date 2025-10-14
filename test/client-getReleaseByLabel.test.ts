import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient.ts"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2.ts"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod.ts"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod.ts"
import { testFetchOptions } from "./__testutils__/testFetchOptions.ts"

import * as prismic from "../src/index.ts"

it("returns a Release by label", async (ctx) => {
	const ref1 = ctx.mock.api.ref({ isMasterRef: true })
	const ref2 = ctx.mock.api.ref({ isMasterRef: false })
	const repositoryResponse = ctx.mock.api.repository()
	repositoryResponse.refs = [ref1, ref2]
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.getReleaseByLabel(ref2.label)

	expect(res).toStrictEqual(ref2)
})

it("throws if Release could not be found", async (ctx) => {
	mockPrismicRestAPIV2({ ctx })

	const client = createTestClient({ ctx })

	await expect(() =>
		client.getReleaseByLabel("non-existant"),
	).rejects.toThrowError(/could not be found/i)
	await expect(() =>
		client.getReleaseByLabel("non-existant"),
	).rejects.toThrowError(prismic.PrismicError)
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getReleaseByLabel("label", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getReleaseByLabel("label", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getReleaseByLabel("label", params),
	mode: "repository",
})
