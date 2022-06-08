import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all tags", async (t) => {
	const response = createRepositoryResponse();
	server.use(createMockRepositoryHandler(t, response));

	const client = createTestClient(t);
	const res = await client.getTags();

	t.deepEqual(res, response.tags);
});

test("uses form endpoint if available", async (t) => {
	const tagsEndpoint = "https://example.com/tags-form-endpoint";
	const tagsResponse = ["foo", "bar"];

	const repositoryResponse = createRepositoryResponse({
		forms: {
			tags: {
				method: "GET",
				action: tagsEndpoint,
				enctype: "",
				fields: {},
			},
		},
	});
	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(tagsEndpoint, (_req, res, ctx) => {
			return res(ctx.json(tagsResponse));
		}),
	);

	const client = createTestClient(t);
	const res = await client.getTags();

	t.deepEqual(res, tagsResponse);
});

test("sends access token if form endpoint is used", async (t) => {
	const tagsEndpoint = "https://example.com/tags-form-endpoint";
	const tagsResponse = ["foo", "bar"];
	const accessToken = "accessToken";

	const repositoryResponse = createRepositoryResponse({
		forms: {
			tags: {
				method: "GET",
				action: tagsEndpoint,
				enctype: "",
				fields: {},
			},
		},
	});
	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(tagsEndpoint, (req, res, ctx) => {
			if (req.url.searchParams.get("access_token") === accessToken) {
				return res(ctx.json(tagsResponse));
			}
		}),
	);

	const client = createTestClient(t, { accessToken });
	const res = await client.getTags();

	t.deepEqual(res, tagsResponse);
});

test("is abortable with an AbortController", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	server.use(createMockRepositoryHandler(t, repositoryResponse));

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => {
			const controller = new AbortController();
			controller.abort();

			await client.getTags({
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
