import test from "ava";
import * as mswNode from "msw/node";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns repository metadata", async (t) => {
	const response = createRepositoryResponse();
	server.use(createMockRepositoryHandler(t, response));

	const client = createTestClient(t);
	const res = await client.getRepository();

	t.deepEqual(res, response);
});

// TODO: Remove when the Authorization header can be used
// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
test("includes access token if configured", async (t) => {
	const options: prismic.ClientConfig = {
		accessToken: "accessToken",
	};

	const response = createRepositoryResponse();
	server.use(createMockRepositoryHandler(t, response, options.accessToken));

	const client = createTestClient(t, options);
	const res = await client.getRepository();

	t.deepEqual(res, response);
});
