import test from "ava";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createRef } from "./__testutils__/createRef";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("uses persisted master ref for all future queries", async t => {
	const queryResponse = createQueryResponse();

	const masterRef1 = createRef(true, { id: "id-1" });
	const repositoryResponse1 = createRepositoryResponse({ refs: [masterRef1] });
	server.use(
		createMockRepositoryHandler(t, repositoryResponse1),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: masterRef1.ref
		})
	);

	const client = createTestClient(t);

	// We tell the client to use the current master ref to query all content.
	await client.queryCurrentContent();
	const res1 = await client.get();

	t.deepEqual(res1, queryResponse);

	const masterRef2 = createRef(true, { id: "id-2" });
	const repositoryResponse2 = createRepositoryResponse({ refs: [masterRef2] });
	server.use(createMockRepositoryHandler(t, repositoryResponse2));

	// Although a new master ref has been set (see `masterRef2`), the client will
	// continue using the previous ref.
	const res2 = await client.get();

	t.deepEqual(res2, queryResponse);
});
