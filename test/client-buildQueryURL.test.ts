import test from "ava";
import * as mswNode from "msw/node";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("builds a query URL using the master ref", async (t) => {
	const response = createRepositoryResponse();
	const ref = getMasterRef(response);
	server.use(createMockRepositoryHandler(t, response));

	const client = createTestClient(t);
	const res = await client.buildQueryURL();
	const url = new URL(res);

	t.is(url.host, new URL(client.endpoint).host);
	t.is(url.pathname, "/api/v2/documents/search");
	t.is(url.search, `?ref=${ref}`);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};

	server.use(createMockRepositoryHandler(t));

	const client = createTestClient(t);
	const res = await client.buildQueryURL(params);
	const url = new URL(res);

	const expectedSearchParams = new URLSearchParams({
		ref: params.ref,
		lang: params.lang?.toString() ?? "",
		// TODO: Remove when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		access_token: params.accessToken ?? "",
	});

	t.is(url.host, new URL(client.endpoint).host);
	t.is(url.pathname, "/api/v2/documents/search");
	t.is(url.searchParams.toString(), expectedSearchParams.toString());
});

test("includes default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" },
	};

	server.use(createMockRepositoryHandler(t));

	const client = createTestClient(t, clientOptions);
	const res = await client.buildQueryURL();
	const url = new URL(res);

	const expectedSearchParams = new URLSearchParams({
		ref: clientOptions.ref?.toString() ?? "",
		lang: clientOptions.defaultParams?.lang?.toString() ?? "",
		// TODO: Remove when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		access_token: clientOptions.accessToken ?? "",
	});

	t.is(url.host, new URL(client.endpoint).host);
	t.is(url.pathname, "/api/v2/documents/search");
	t.is(url.searchParams.toString(), expectedSearchParams.toString());
});

test("merges params and default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*", page: 2 },
	};
	const params: prismic.BuildQueryURLArgs = {
		ref: "overridden-ref",
	};

	server.use(createMockRepositoryHandler(t));

	const client = createTestClient(t, clientOptions);
	const res = await client.buildQueryURL(params);
	const url = new URL(res);

	const expectedSearchParams = new URLSearchParams({
		ref: params.ref,
		lang: clientOptions.defaultParams?.lang?.toString() ?? "",
		page: clientOptions.defaultParams?.page?.toString() ?? "",
		// TODO: Remove when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		access_token: clientOptions.accessToken ?? "",
	});

	t.is(url.host, new URL(client.endpoint).host);
	t.is(url.pathname, "/api/v2/documents/search");
	t.is(url.searchParams.toString(), expectedSearchParams.toString());
});
