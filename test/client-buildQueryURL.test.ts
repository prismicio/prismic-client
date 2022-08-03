import { it, expect } from "vitest";

import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

it("builds a query URL using the master ref", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	const ref = getMasterRef(repositoryResponse);

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});

	const client = createTestClient();
	const res = await client.buildQueryURL();
	const url = new URL(res);

	const expectedSearchParams = new URLSearchParams({
		ref,
	});
	url.searchParams.delete("integrationFieldsRef");
	url.searchParams.sort();
	expectedSearchParams.sort();

	expect(url.host).toBe(new URL(client.endpoint).host);
	expect(url.pathname).toBe("/api/v2/documents/search");
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString());
});

it("includes params if provided", async (ctx) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();
	const res = await client.buildQueryURL(params);
	const url = new URL(res);

	const expectedSearchParams = new URLSearchParams({
		ref: params.ref,
		lang: params.lang?.toString() ?? "",
		// TODO: Remove when Authorization header support works in browsers with CORS.
		access_token: params.accessToken ?? "",
	});

	url.searchParams.delete("integrationFieldsRef");
	url.searchParams.sort();
	expectedSearchParams.sort();

	expect(url.host).toBe(new URL(client.endpoint).host);
	expect(url.pathname).toBe("/api/v2/documents/search");
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString());
});

it("includes default params if provided", async (ctx) => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" },
	};

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient({ clientConfig });
	const res = await client.buildQueryURL();
	const url = new URL(res);

	const expectedSearchParams = new URLSearchParams({
		ref: clientConfig.ref?.toString() ?? "",
		lang: clientConfig.defaultParams?.lang?.toString() ?? "",
		// TODO: Remove when Authorization header support works in browsers with CORS.
		access_token: clientConfig.accessToken ?? "",
	});

	url.searchParams.delete("integrationFieldsRef");
	url.searchParams.sort();
	expectedSearchParams.sort();

	expect(url.host).toBe(new URL(client.endpoint).host);
	expect(url.pathname).toBe("/api/v2/documents/search");
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString());
});

it("merges params and default params if provided", async (ctx) => {
	const clientConfig: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*", page: 2 },
	};
	const params: prismic.BuildQueryURLArgs = {
		ref: "overridden-ref",
	};

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient({ clientConfig });
	const res = await client.buildQueryURL(params);
	const url = new URL(res);

	const expectedSearchParams = new URLSearchParams({
		ref: params.ref,
		lang: clientConfig.defaultParams?.lang?.toString() ?? "",
		page: clientConfig.defaultParams?.page?.toString() ?? "",
		// TODO: Remove when Authorization header support works in browsers with CORS.
		access_token: clientConfig.accessToken ?? "",
	});

	url.searchParams.delete("integrationFieldsRef");
	url.searchParams.sort();
	expectedSearchParams.sort();

	expect(url.host).toBe(new URL(client.endpoint).host);
	expect(url.pathname).toBe("/api/v2/documents/search");
	expect(url.searchParams.toString()).toBe(expectedSearchParams.toString());
});
