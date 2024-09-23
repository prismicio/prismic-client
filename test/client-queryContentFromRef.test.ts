import { expect, it } from "vitest"

import * as prismicM from "@prismicio/mock"

import { createTestClient } from "./__testutils__/createClient"
import { getMasterRef } from "./__testutils__/getMasterRef"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testGetMethod } from "./__testutils__/testAnyGetMethod"

testGetMethod("supports manual string ref", {
	run: (client) => {
		client.queryContentFromRef("ref")

		return client.get()
	},
	requiredParams: {
		ref: "ref",
	},
})

testGetMethod("supports manual thunk ref", {
	run: (client) => {
		client.queryContentFromRef(async () => "thunk")

		return client.get()
	},
	requiredParams: {
		ref: "thunk",
	},
})

it("uses master ref if manual thunk ref returns non-string value", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	const queryResponse = prismicM.api.query({ seed: ctx.task.name })

	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: getMasterRef(repositoryResponse),
		},
		ctx,
	})

	const client = createTestClient({ ctx })

	client.queryContentFromRef(async () => undefined)

	const res = await client.get()

	expect(res).toStrictEqual(queryResponse)
})
