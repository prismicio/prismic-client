import { it, expect, beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";
import * as prismicM from "@prismicio/mock";

import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { createRef } from "./__testutils__/createRef";
import {
	testGetOutsideTTL,
	testGetWithinTTL,
} from "./__testutils__/testGetTTL";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

const ref1 = createRef(false);
const ref2 = createRef(false, { id: ref1.id });

it("uses a releases ref by ID", async (ctx) => {
	const repositoryResponse = createRepositoryResponse({ refs: [ref1] });
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: ref1.ref,
		},
		server,
	});

	const client = createTestClient();

	client.queryContentFromReleaseByID(ref1.id);

	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

testGetWithinTTL("uses the cached release ref within the ref's TTL", {
	getContext: {
		repositoryResponse: createRepositoryResponse({ refs: [ref1] }),
		getRef: () => ref1.ref,
	},
	beforeFirstGet: (args) => args.client.queryContentFromReleaseByID(ref1.id),
	server,
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
	beforeFirstGet: (args) => args.client.queryContentFromReleaseByID(ref1.id),
	server,
});
