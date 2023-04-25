import { TestContext, expect, it, vi } from "vitest";

import { rest } from "msw";
import fetch from "node-fetch";

import { createTestClient } from "./createClient";
import { createPagedQueryResponses } from "./createPagedQueryResponses";
import { createRepositoryName } from "./createRepositoryName";
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";

import * as prismic from "../../src";

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

const runTest = async (
	ctx: TestContext,
	args: TestConcurrentMethodArgs,
	clientParams?: Parameters<prismic.Client["get"]>[0],
) => {
	const fetchSpy = vi.fn(fetch);
	const controller1 = new AbortController();
	const controller2 = new AbortController();

	const ref1 = ctx.mock.api.ref({ isMasterRef: true });
	const ref2 = ctx.mock.api.ref({ isMasterRef: false });
	ref2.id = "id";
	ref2.label = "label";
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [ref1, ref2];

	const queryResponse = createPagedQueryResponses({ ctx });

	mockPrismicRestAPIV2({
		ctx,
		repositoryResponse,
		queryResponse,
		// A small delay is needed to simulate a real network
		// request. Without the delay, network requests would
		// not be shared.
		queryDelay: 10,
	});

	const client = createTestClient({ clientConfig: { fetch: fetchSpy } });

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };
	ctx.server.use(
		rest.get(graphqlURL, (req, res, ctx) => {
			if (req.headers.get("Prismic-Ref") === ref1.ref) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	await Promise.all([
		// Shared
		args.run(client),
		args.run(client),

		// Shared
		args.run(client, { ...clientParams, signal: controller1.signal }),
		args.run(client, { ...clientParams, signal: controller1.signal }),

		// Shared
		args.run(client, { ...clientParams, signal: controller2.signal }),
		args.run(client, { ...clientParams, signal: controller2.signal }),
	]);

	// Not shared
	await args.run(client);
	await args.run(client);

	// `get` methods use a total of 6 requests:
	// - 1x /api/v2 (shared across all requests)
	// - 5x /api/v2/documents/search

	// `getAll` methods use a total of 11 requests:
	// - 1x /api/v2 (shared across all requests)
	// - 10x /api/v2/documents/search

	const hasConcurrentRequestsEnabled =
		clientParams?.optimize?.concurentRequests ?? true;

	switch (args.mode) {
		case "get": {
			expect(fetchSpy.mock.calls.length).toBe(
				hasConcurrentRequestsEnabled ? 6 : 8,
			);

			break;
		}

		case "getAll": {
			expect(fetchSpy.mock.calls.length).toBe(
				hasConcurrentRequestsEnabled ? 11 : 15,
			);

			break;
		}

		case "repository": {
			expect(fetchSpy.mock.calls.length).toBe(
				hasConcurrentRequestsEnabled ? 5 : 7,
			);

			break;
		}

		case "tags": {
			expect(fetchSpy.mock.calls.length).toBe(
				hasConcurrentRequestsEnabled ? 8 : 12,
			);

			break;
		}

		case "resolvePreview": {
			expect(fetchSpy.mock.calls.length).toBe(
				hasConcurrentRequestsEnabled ? 8 : 10,
			);

			break;
		}

		// GraphQL requests are not shared.
		case "NOT-SHARED___graphQL": {
			expect(fetchSpy.mock.calls.length).toBe(9);

			break;
		}

		default: {
			throw new Error(`Invalid mode: ${args.mode}`);
		}
	}
};

export const testConcurrentMethod = (
	description: string,
	args: TestConcurrentMethodArgs,
): void => {
	it.concurrent(`${description} (default)`, async (ctx) => {
		await runTest(ctx, args);
	});

	it.concurrent(
		`${description} (optimize.concurrentRequests = true)`,
		async (ctx) => {
			await runTest(ctx, args, {
				optimize: {
					concurentRequests: true,
				},
			});
		},
	);

	it.concurrent(
		`${description} (optimize.concurrentRequests = false)`,
		async (ctx) => {
			await runTest(ctx, args, {
				optimize: {
					concurentRequests: false,
				},
			});
		},
	);
};
