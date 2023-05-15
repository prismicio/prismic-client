import { it, expect } from "vitest";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

it("returns repository metadata", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});

	const client = createTestClient();
	const res = await client.getRepository();

	expect(res).toStrictEqual(repositoryResponse);
});

// TODO: Remove when Authorization header support works in browsers with CORS.
it("includes access token if configured", async (ctx) => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "accessToken",
	};

	const repositoryResponse = ctx.mock.api.repository();
	mockPrismicRestAPIV2({
		repositoryResponse,
		accessToken: clientConfig.accessToken,
		ctx,
	});

	const client = createTestClient({ clientConfig });
	const res = await client.getRepository();

	expect(res).toStrictEqual(repositoryResponse);
});

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getRepository(params),
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getRepository(params),
});
