import { TestContext, expect, it, vi } from "vitest";

import fetch from "node-fetch";

import { createTestClient } from "./createClient";
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";

import * as prismic from "../../src";

type RunTestConfig = {
	run: TestFetchOptionsArgs["run"];
	expectedFetchOptions: prismic.RequestInitLike;
	clientFetchOptions?: prismic.RequestInitLikeOrThunk;
	methodFetchOptions?: prismic.RequestInitLikeOrThunk;
};

const runTest = async (ctx: TestContext, config: RunTestConfig) => {
	const fetchSpy = vi.fn(fetch);

	const masterRef = ctx.mock.api.ref({ isMasterRef: true });
	const releaseRef = ctx.mock.api.ref({ isMasterRef: false });
	releaseRef.id = "id"; // Referenced in ref-related tests.
	releaseRef.label = "label"; // Referenced in ref-related tests.
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [masterRef, releaseRef];

	mockPrismicRestAPIV2({
		ctx,
		repositoryResponse,
		queryResponse: ctx.mock.api.query({
			documents: [ctx.mock.value.document()],
		}),
	});

	const client = createTestClient({
		clientConfig: {
			fetch: fetchSpy,
			fetchOptions: config.clientFetchOptions,
		},
	});

	await config.run(client, {
		fetchOptions: config.methodFetchOptions,
	});

	for (const [input, init] of fetchSpy.mock.calls) {
		expect(init, input.toString()).toStrictEqual(config.expectedFetchOptions);
	}
};

type TestFetchOptionsArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>;
};

export const testFetchOptions = (
	description: string,
	args: TestFetchOptionsArgs,
): void => {
	const abortController = new AbortController();

	const fetchOptions: prismic.RequestInitLike = {
		cache: "no-store",
		headers: {
			foo: "bar",
		},
		signal: abortController.signal,
	};

	it.concurrent(`${description} (on client, object)`, async (ctx) => {
		await runTest(ctx, {
			run: args.run,
			clientFetchOptions: fetchOptions,
			expectedFetchOptions: fetchOptions,
		});
	});

	it.concurrent(`${description} (on client, thunk)`, async (ctx) => {
		await runTest(ctx, {
			run: args.run,
			clientFetchOptions: () => fetchOptions,
			expectedFetchOptions: fetchOptions,
		});
	});

	it.concurrent(`${description} (on method, object)`, async (ctx) => {
		await runTest(ctx, {
			run: args.run,
			methodFetchOptions: fetchOptions,
			expectedFetchOptions: fetchOptions,
		});
	});

	it.concurrent(`${description} (on method, thunk)`, async (ctx) => {
		await runTest(ctx, {
			run: args.run,
			methodFetchOptions: fetchOptions,
			expectedFetchOptions: fetchOptions,
		});
	});

	it.concurrent(
		`${description} (on client and method, object)`,
		async (ctx) => {
			const overrides = {
				headers: {
					baz: "qux",
				},
			};

			await runTest(ctx, {
				run: args.run,
				clientFetchOptions: fetchOptions,
				methodFetchOptions: overrides,
				expectedFetchOptions: {
					...fetchOptions,
					headers: {
						...fetchOptions.headers,
						...overrides.headers,
					},
				},
			});
		},
	);

	it.concurrent(`${description} (on client and method, thunk)`, async (ctx) => {
		const overrides = {
			headers: {
				baz: "qux",
			},
		};

		await runTest(ctx, {
			run: args.run,
			clientFetchOptions: fetchOptions,
			methodFetchOptions: () => overrides,
			expectedFetchOptions: {
				...fetchOptions,
				headers: {
					...fetchOptions.headers,
					...overrides.headers,
				},
			},
		});
	});
};
