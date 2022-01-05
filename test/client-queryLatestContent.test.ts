import test from "ava";
import * as mswNode from "msw/node";

import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { getMasterRef } from "./__testutils__/getMasterRef";

import { getWithinTTLMacro } from "./__testutils__/getWithinTTLMacro";
import { getOutsideTTLMacro } from "./__testutils__/getOutsideTTLMacro";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("uses the cached master ref within the ref's ttl", getWithinTTLMacro, {
	server,
	getContext: {
		repositoryResponse: createRepositoryResponse(),
		getRef: getMasterRef,
	},
	beforeFirstGet: (args) => args.client.queryLatestContent(),
});

test(
	"uses a fresh master ref outside of the cached ref's ttl",
	getOutsideTTLMacro,
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
