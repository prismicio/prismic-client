import test from "ava";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

import { getWithinTTLMacro } from "./__testutils__/getWithinTTLMacro";
import { getOutsideTTLMacro } from "./__testutils__/getOutsideTTLMacro";
import { createRef } from "./__testutils__/createRef";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

const ref1 = createRef(false);
const ref2 = createRef(false, { label: ref1.label });

test("uses a releases ref by label", async (t) => {
	const repositoryResponse = createRepositoryResponse({ refs: [ref1] });
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: ref1.ref,
		}),
	);

	const client = createTestClient(t);

	client.queryContentFromReleaseByLabel(ref1.label);

	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("uses the cached release ref within the ref's ttl", getWithinTTLMacro, {
	server,
	getContext: {
		repositoryResponse: createRepositoryResponse({ refs: [ref1] }),
		getRef: () => ref1.ref,
	},
	beforeFirstGet: (args) =>
		args.client.queryContentFromReleaseByLabel(ref1.label),
});

test(
	"uses a fresh release ref outside of the cached ref's ttl",
	getOutsideTTLMacro,
	{
		server,
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
	},
);
