import { it, expect, beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { createRef } from "./__testutils__/createRef";
import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

it("returns the master ref", async () => {
	const masterRef = createRef(true);
	const ref2 = createRef(false);
	const response = createRepositoryResponse({ refs: [ref2, masterRef] });

	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server,
	});

	const client = createTestClient();
	const res = await client.getMasterRef();

	expect(res).toStrictEqual(masterRef);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getMasterRef({ signal }),
	server,
});
