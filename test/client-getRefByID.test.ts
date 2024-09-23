import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

import * as prismic from "../src"

it("returns a ref by ID", async (ctx) => {
	const ref1 = ctx.mock.api.ref({ isMasterRef: true })
	const ref2 = ctx.mock.api.ref({ isMasterRef: false })
	const repositoryResponse = ctx.mock.api.repository()
	repositoryResponse.refs = [ref1, ref2]
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})

	const client = createTestClient({ ctx })
	const res = await client.getRefByID(ref2.id)

	expect(res).toStrictEqual(ref2)
})

it("throws if ref could not be found", async (ctx) => {
	mockPrismicRestAPIV2({
		ctx,
	})

	const client = createTestClient({ ctx })

	await expect(() => client.getRefByID("non-existant")).rejects.toThrowError(
		/could not be found/i,
	)
	await expect(() => client.getRefByID("non-existant")).rejects.toThrowError(
		prismic.PrismicError,
	)
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getRefByID("id", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getRefByID("id", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getRefByID("id", params),
	mode: "repository",
})
