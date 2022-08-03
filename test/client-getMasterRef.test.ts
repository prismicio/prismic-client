import { it, expect } from "vitest";

import { createRef } from "./__testutils__/createRef";
import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";

it("returns the master ref", async (ctx) => {
	const masterRef = createRef(true);
	const ref2 = createRef(false);
	const response = createRepositoryResponse({ refs: [ref2, masterRef] });

	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server: ctx.server,
	});

	const client = createTestClient();
	const res = await client.getMasterRef();

	expect(res).toStrictEqual(masterRef);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getMasterRef({ signal }),
});
