import { it, expect } from "vitest";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

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

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getMasterRef({ signal }),
});
