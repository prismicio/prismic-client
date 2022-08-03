import { it, expect } from "vitest";
import * as prismicM from "@prismicio/mock";

import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { createRef } from "./__testutils__/createRef";
import {
	testGetOutsideTTL,
	testGetWithinTTL,
} from "./__testutils__/testGetTTL";

const ref1 = createRef(false);
const ref2 = createRef(false, { label: ref1.label });

it("uses a releases ref by label", async (ctx) => {
	const repositoryResponse = createRepositoryResponse({ refs: [ref1] });
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: ref1.ref,
		},
		server: ctx.server,
	});

	const client = createTestClient();

	client.queryContentFromReleaseByLabel(ref1.label);

	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

testGetWithinTTL("uses the cached release ref within the ref's TTL", {
	getContext: {
		repositoryResponse: createRepositoryResponse({ refs: [ref1] }),
		getRef: () => ref1.ref,
	},
	beforeFirstGet: (args) =>
		args.client.queryContentFromReleaseByLabel(ref1.label),
});

testGetOutsideTTL("uses a fresh release ref outside of the cached ref's TTL", {
	getContext1: {
		repositoryResponse: createRepositoryResponse({ refs: [ref1] }),
		getRef: () => ref1.ref,
	},
	getContext2: {
		repositoryResponse: createRepositoryResponse({ refs: [ref2] }),
		getRef: () => ref2.ref,
	},
	beforeFirstGet: (args) =>
		args.client.queryContentFromReleaseByLabel(ref1.label),
});
