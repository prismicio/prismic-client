import { it, expect } from "vitest";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";

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
	run: (client, signal) => client.getRefs({ signal }),
});
