import { it, expect, beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

it("returns all Releases", async () => {
	const response = createRepositoryResponse();
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server,
	});

	const client = createTestClient();
	const res = await client.getReleases();

	expect(res).toStrictEqual(response.refs.filter((ref) => !ref.isMasterRef));
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getReleases({ signal }),
	server,
});
