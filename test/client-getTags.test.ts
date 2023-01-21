import * as msw from "msw";
import { expect, it } from "vitest";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

it("returns all tags", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});

	const client = createTestClient();
	const res = await client.getTags();

	expect(res).toStrictEqual(repositoryResponse.tags);
});

it("uses form endpoint if available", async (ctx) => {
	const tagsEndpoint = "https://example.com/tags-form-endpoint";
	const tagsResponse = ["foo", "bar"];

	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.forms = {
		tags: {
			method: "GET",
			action: tagsEndpoint,
			enctype: "",
			fields: {},
		},
	};
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
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

	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.forms = {
		tags: {
			method: "GET",
			action: tagsEndpoint,
			enctype: "",
			fields: {},
		},
	};
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
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
