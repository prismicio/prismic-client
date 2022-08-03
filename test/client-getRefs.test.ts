import { it, expect } from "vitest";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

it("returns all refs", async (ctx) => {
	const response = createRepositoryResponse();
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server: ctx.server,
	});

	const client = createTestClient();
	const res = await client.getRefs();

	expect(res).toStrictEqual(response.refs);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getRefs({ signal }),
});
