import { it, expect } from "vitest";
import * as msw from "msw";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";

it("returns all tags", async (ctx) => {
	const response = createRepositoryResponse();
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server: ctx.server,
	});

	const client = createTestClient();
	const res = await client.getTags();

	expect(res).toStrictEqual(response.tags);
});

it("uses form endpoint if available", async (ctx) => {
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
	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server: ctx.server,
	});
	ctx.server.use(
		msw.rest.get(tagsEndpoint, (_req, res, ctx) => {
			return res(ctx.json(tagsResponse));
		}),
	);

	const client = createTestClient();
	const res = await client.getTags();

	expect(res).toStrictEqual(tagsResponse);
});

it("sends access token if form endpoint is used", async (ctx) => {
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
	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server: ctx.server,
	});
	ctx.server.use(
		msw.rest.get(tagsEndpoint, (req, res, ctx) => {
			if (req.url.searchParams.get("access_token") === accessToken) {
				return res(ctx.json(tagsResponse));
			}
		}),
	);

	const client = createTestClient({ clientConfig: { accessToken } });
	const res = await client.getTags();

	expect(res).toStrictEqual(tagsResponse);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getTags({ signal }),
});
