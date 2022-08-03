import { it, expect } from "vitest";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";

it("returns repository metadata", async (ctx) => {
	const response = createRepositoryResponse();
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server: ctx.server,
	});

	const client = createTestClient();
	const res = await client.getRepository();

	expect(res).toStrictEqual(response);
});

// TODO: Remove when Authorization header support works in browsers with CORS.
it("includes access token if configured", async (ctx) => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "accessToken",
	};

	const response = createRepositoryResponse();
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		accessToken: clientConfig.accessToken,
		server: ctx.server,
	});

	const client = createTestClient({ clientConfig });
	const res = await client.getRepository();

	expect(res).toStrictEqual(response);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getRepository({ signal }),
});
