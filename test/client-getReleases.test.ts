import { expect, it } from "vitest";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

it("returns all Releases", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});

	const client = createTestClient();
	const res = await client.getReleases();

	expect(res).toStrictEqual(
		repositoryResponse.refs.filter((ref) => !ref.isMasterRef),
	);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getReleases({ signal }),
});
