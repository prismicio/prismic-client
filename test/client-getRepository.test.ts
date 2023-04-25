import { expect, it, vi } from "vitest";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod";

import * as prismic from "../src";

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

it("uses a cache-busting URL parameter by default", async (ctx) => {
	mockPrismicRestAPIV2({ ctx });

	const fetchSpy = vi.fn(fetch);
	const client = createTestClient({
		clientConfig: {
			fetch: fetchSpy,
		},
	});

	await client.getRepository();

	const call = fetchSpy.mock.calls.find(
		(call) => new URL(call[0] as string).pathname === "/api/v2",
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const url = new URL(call![0] as string);

	expect(url.searchParams.has("x-optimize-ts")).toBe(true);
});

it("uses a cache-busting URL parameter when `optimizeRepositoryRequest` is `true`", async (ctx) => {
	mockPrismicRestAPIV2({ ctx });

	const fetchSpy = vi.fn(fetch);
	const client = createTestClient({
		clientConfig: {
			optimize: {
				repositoryRequests: true,
			},
			fetch: fetchSpy,
		},
	});

	await client.getRepository();

	const call = fetchSpy.mock.calls.find(
		(call) => new URL(call[0] as string).pathname === "/api/v2",
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const url = new URL(call![0] as string);

	expect(url.searchParams.has("x-optimize-ts")).toBe(true);
});

it("does not use a cache-busting URL parameter when `optimizeRepositoryRequest` is `false`", async (ctx) => {
	mockPrismicRestAPIV2({ ctx });

	const fetchSpy = vi.fn(fetch);
	const client = createTestClient({
		clientConfig: {
			optimize: {
				repositoryRequests: false,
			},
			fetch: fetchSpy,
		},
	});

	await client.getRepository();

	const call = fetchSpy.mock.calls.find(
		(call) => new URL(call[0] as string).pathname === "/api/v2",
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const url = new URL(call![0] as string);

	expect(url.searchParams.has("x-optimize-ts")).toBe(false);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getRepository({ signal }),
});

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, signal) => client.getRepository({ signal }),
	mode: "repository",
});
