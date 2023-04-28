import { TestContext, expect, it, vi } from "vitest";

import { rest } from "msw";
import fetch from "node-fetch";

import { createTestClient } from "./createClient";
import { createPagedQueryResponses } from "./createPagedQueryResponses";
import { createRepositoryName } from "./createRepositoryName";
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";

import * as prismic from "../../src";

type TestConcurrentMethodArgsMode =
	| "get"
	| "getAll"
	| "repository"
	| "tags"
	| "resolvePreview"
	| "NOT-SHARED___graphQL";

const EXPECTED_REQUEST_COUNTS: Record<
	TestConcurrentMethodArgsMode,
	{
		enabled: number;
		enabledClient?: number;
		enabledRequest?: number;
		disabled: number;
		disabledClient?: number;
		disabledRequest?: number;
	}
> = {
	get: {
		enabled: 8,
		disabled: 14,
	},
	getAll: {
		enabled: 13,
		disabled: 22,
	},
	repository: {
		enabled: 5,
		disabled: 8,
	},
	tags: {
		enabled: 8,
		disabled: 14,
	},
	resolvePreview: {
		enabled: 8,
		disabled: 14,
	},
	"NOT-SHARED___graphQL": {
		enabled: 9,
		disabled: 14,
		disabledRequest: 9,
	},
};

type RunTestArgs = Pick<TestConcurrentMethodArgs, "run"> & {
	ctx: TestContext;
	clientParams?: prismic.ClientConfig;
	requestParams?: Parameters<prismic.Client["get"]>[0];
	expectedNumberOfRequests: number;
};

const runTest = async (args: RunTestArgs) => {
	const fetchSpy = vi.fn(fetch);
	const controller1 = new AbortController();
	const controller2 = new AbortController();

	const ref1 = args.ctx.mock.api.ref({ isMasterRef: true });
	const ref2 = args.ctx.mock.api.ref({ isMasterRef: false });
	ref2.id = "id";
	ref2.label = "label";
	const repositoryResponse = args.ctx.mock.api.repository();
	repositoryResponse.refs = [ref1, ref2];

	const queryResponse = createPagedQueryResponses({ ctx: args.ctx });

	mockPrismicRestAPIV2({
		ctx: args.ctx,
		repositoryResponse,
		queryResponse,
		// A small delay is needed to simulate a real network
		// request. Without the delay, network requests would
		// not be shared.
		queryDelay: 10,
	});

	const client = createTestClient({
		clientConfig: { ...args.clientParams, fetch: fetchSpy },
	});

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };
	args.ctx.server.use(
		rest.get(graphqlURL, (_req, res, ctx) => {
			return res(ctx.json(graphqlResponse));
		}),
	);

	await Promise.all([
		// Shared
		args.run(client, args.requestParams),
		args.run(client, args.requestParams),

		// Shared
		args.run(client, { ...args.requestParams, signal: controller1.signal }),
		args.run(client, { ...args.requestParams, signal: controller1.signal }),

		// Shared
		args.run(client, { ...args.requestParams, signal: controller2.signal }),
		args.run(client, { ...args.requestParams, signal: controller2.signal }),
	]);

	// Not shared
	await args.run(client, args.requestParams);
	await args.run(client, args.requestParams);

	expect(fetchSpy.mock.calls.length).toBe(args.expectedNumberOfRequests);
};

type TestConcurrentMethodArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>;
	mode:
		| "get"
		| "getAll"
		| "repository"
		| "tags"
		| "resolvePreview"
		| "NOT-SHARED___graphQL";
};

export const testConcurrentMethod = (
	description: string,
	args: TestConcurrentMethodArgs,
): void => {
	const expectedRequestCounts = EXPECTED_REQUEST_COUNTS[args.mode];

	it.concurrent(`${description} (default)`, async (ctx) => {
		await runTest({
			ctx,
			run: args.run,
			expectedNumberOfRequests: expectedRequestCounts.enabled,
		});
	});

	it.concurrent(
		`${description} (client optimize.concurrentRequests = true)`,
		async (ctx) => {
			await runTest({
				ctx,
				run: args.run,
				clientParams: {
					optimize: {
						concurrentRequests: true,
					},
				},
				expectedNumberOfRequests:
					expectedRequestCounts.enabledClient ?? expectedRequestCounts.enabled,
			});
		},
	);

	it.concurrent(
		`${description} (request optimize.concurrentRequests = true)`,
		async (ctx) => {
			await runTest({
				ctx,
				run: args.run,
				requestParams: {
					optimize: {
						concurrentRequests: true,
					},
				},
				expectedNumberOfRequests:
					expectedRequestCounts.enabledRequest ?? expectedRequestCounts.enabled,
			});
		},
	);

	it.concurrent(
		`${description} (client optimize.concurrentRequests = false)`,
		async (ctx) => {
			await runTest({
				ctx,
				run: args.run,
				clientParams: {
					optimize: {
						concurrentRequests: false,
					},
				},
				expectedNumberOfRequests:
					expectedRequestCounts.disabledClient ??
					expectedRequestCounts.disabled,
			});
		},
	);

	it.concurrent(
		`${description} (request optimize.concurrentRequests = false)`,
		async (ctx) => {
			await runTest({
				ctx,
				run: args.run,
				requestParams: {
					optimize: {
						concurrentRequests: false,
					},
				},
				expectedNumberOfRequests:
					expectedRequestCounts.disabledRequest ??
					expectedRequestCounts.disabled,
			});
		},
	);
};
