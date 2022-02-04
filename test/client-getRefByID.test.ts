import test from "ava";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { createRef } from "./__testutils__/createRef";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns a ref by ID", async (t) => {
	const ref1 = createRef(true);
	const ref2 = createRef(false);
	const response = createRepositoryResponse({ refs: [ref1, ref2] });
	server.use(createMockRepositoryHandler(t, response));

	const client = createTestClient(t);
	const res = await client.getRefByID(ref2.id);

	t.deepEqual(res, ref2);
});

test("throws if ref could not be found", async (t) => {
	server.use(createMockRepositoryHandler(t));

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.getRefByID("non-existant"), {
		instanceOf: prismic.PrismicError,
		message: /could not be found/i,
	});
});

test("is abortable with an AbortController", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	server.use(createMockRepositoryHandler(t, repositoryResponse));

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => {
			const controller = new AbortController();
			controller.abort();

			await client.getRefByID("id", {
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
