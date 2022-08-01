import { it, expect, beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";
import * as prismicM from "@prismicio/mock";

import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetMethod("supports manual string ref", {
	run: (client) => {
		client.queryContentFromRef("ref");

		return client.get();
	},
	requiredParams: {
		ref: "ref",
	},
	server,
});

testGetMethod("supports manual thunk ref", {
	run: (client) => {
		client.queryContentFromRef(async () => "thunk");

		return client.get();
	},
	requiredParams: {
		ref: "thunk",
	},
	server,
});

it("uses master ref if manual thunk ref returns non-string value", async (ctx) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: getMasterRef(repositoryResponse),
		},
		server,
	});

	const client = createTestClient();

	client.queryContentFromRef(async () => undefined);

	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});
