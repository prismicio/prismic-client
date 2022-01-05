import test from "ava";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("supports manual string ref", async (t) => {
	const queryResponse = createQueryResponse();
	const ref = "ref";

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, { ref }),
	);

	const client = createTestClient(t);

	client.queryContentFromRef(ref);

	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("supports manual thunk ref", async (t) => {
	const queryResponse = createQueryResponse();
	const ref = "ref";

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, { ref }),
	);

	const client = createTestClient(t);

	client.queryContentFromRef(async () => ref);

	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("uses master ref if manual thunk ref returns non-string value", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
		}),
	);

	const client = createTestClient(t);

	client.queryContentFromRef(async () => undefined);

	const res = await client.get();

	t.deepEqual(res, queryResponse);
});
