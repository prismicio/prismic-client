import { it, expect } from "vitest";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

it("returns the master ref", async (ctx) => {
	const masterRef = ctx.mock.api.ref({ isMasterRef: true });
	const ref2 = ctx.mock.api.ref({ isMasterRef: false });
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [ref2, masterRef];

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});

	const client = createTestClient();
	const res = await client.getMasterRef();

	expect(res).toStrictEqual(masterRef);
});

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getMasterRef(params),
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getMasterRef(params),
});
