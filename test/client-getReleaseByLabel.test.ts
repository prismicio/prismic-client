import test from "ava";
import * as mswNode from "msw/node";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { createRef } from "./__testutils__/createRef";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns a Release by label", async (t) => {
	const ref1 = createRef(true);
	const ref2 = createRef(false);
	const response = createRepositoryResponse({ refs: [ref1, ref2] });
	server.use(createMockRepositoryHandler(t, response));

	const client = createTestClient(t);
	const res = await client.getReleaseByLabel(ref2.label);

	t.deepEqual(res, ref2);
});

test("throws if Release could not be found", async (t) => {
	server.use(createMockRepositoryHandler(t));

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => await client.getReleaseByLabel("non-existant"),
		{
			message: /could not be found/i,
		},
	);
});
