import { it, expect, beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

it("returns repository metadata", async () => {
	const response = createRepositoryResponse();
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server,
	});

	const client = createTestClient();
	const res = await client.getRepository();

	expect(res).toStrictEqual(response);
});

// TODO: Remove when Authorization header support works in browsers with CORS.
it("includes access token if configured", async () => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "accessToken",
	};

	const response = createRepositoryResponse();
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		accessToken: clientConfig.accessToken,
		server,
	});

	const client = createTestClient({ clientConfig });
	const res = await client.getRepository();

	expect(res).toStrictEqual(response);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getRepository({ signal }),
	server,
});
