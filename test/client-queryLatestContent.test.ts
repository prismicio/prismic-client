import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { getMasterRef } from "./__testutils__/getMasterRef";
import {
	testGetOutsideTTL,
	testGetWithinTTL,
} from "./__testutils__/testGetTTL";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetWithinTTL("uses the cached master ref within the ref's TTL", {
	server,
	getContext: {
		repositoryResponse: createRepositoryResponse(),
		getRef: getMasterRef,
	},
	beforeFirstGet: (args) => args.client.queryLatestContent(),
});

testGetOutsideTTL(
	"uses a fresh master ref outside of the cached ref's TTL",

	{
		server,
		getContext1: {
			repositoryResponse: createRepositoryResponse(),
			getRef: getMasterRef,
		},
		getContext2: {
			repositoryResponse: createRepositoryResponse(),
			getRef: getMasterRef,
		},
		beforeFirstGet: (args) => args.client.queryLatestContent(),
	},
);
