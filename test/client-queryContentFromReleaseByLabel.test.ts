import { expect, it } from "vitest"

import * as prismicM from "@prismicio/mock"

import { createTestClient } from "./__testutils__/createClient"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testGetOutsideTTL, testGetWithinTTL } from "./__testutils__/testGetTTL"

// Do not use `_mock` within tests. Use the text-specific `ctx.mock` instead.
const _mock = prismicM.createMockFactory({
	seed: "queryContentFromReleaseByLabel",
})
const ref1 = _mock.api.ref({ isMasterRef: false })
const ref2 = _mock.api.ref({ isMasterRef: false })
ref2.label = ref1.label

it("uses a releases ref by label", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	repositoryResponse.refs = [ref1]
	const queryResponse = prismicM.api.query({ seed: ctx.task.name })

	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: ref1.ref,
		},
		ctx,
	})

	const client = createTestClient({ ctx })

	client.queryContentFromReleaseByLabel(ref1.label)

	const res = await client.get()

	expect(res).toStrictEqual(queryResponse)
})

testGetWithinTTL("uses the cached release ref within the ref's TTL", {
	getContext: {
		repositoryResponse: { refs: [ref1] },
		getRef: () => ref1.ref,
	},
	beforeFirstGet: (args) =>
		args.client.queryContentFromReleaseByLabel(ref1.label),
})

testGetOutsideTTL("uses a fresh release ref outside of the cached ref's TTL", {
	getContext1: {
		repositoryResponse: { refs: [ref1] },
		getRef: () => ref1.ref,
	},
	getContext2: {
		repositoryResponse: { refs: [ref2] },
		getRef: () => ref2.ref,
	},
	beforeFirstGet: (args) =>
		args.client.queryContentFromReleaseByLabel(ref1.label),
})
