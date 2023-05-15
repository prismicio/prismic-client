import { it, expect } from "vitest";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

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

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getReleases(params),
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getReleases(params),
});
