import { expect, it } from "vitest";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod";

it("returns all refs", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});

	const client = createTestClient();
	const res = await client.getRefs();

	expect(res).toStrictEqual(repositoryResponse.refs);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getRefs(params),
});

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getRefs(params),
	mode: "repository",
});
