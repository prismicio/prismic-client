import test from "ava";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all Releases", async (t) => {
	const response = createRepositoryResponse();
	server.use(createMockRepositoryHandler(t, response));

	const client = createTestClient(t);
	const res = await client.getReleases();

	t.deepEqual(
		res,
		response.refs.filter((ref) => !ref.isMasterRef),
	);
});

test("is abortable with an AbortController", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	server.use(createMockRepositoryHandler(t, repositoryResponse));

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => {
			const controller = new AbortController();
			controller.abort();

			await client.getReleases({
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
