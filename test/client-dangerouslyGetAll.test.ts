import test from "ava";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createQueryResponsePages } from "./__testutils__/createQueryResponsePages";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";
import { GET_ALL_QUERY_DELAY } from "../src/client";

/**
 * Tolerance in number of milliseconds for the duration of a simulated network request.
 *
 * If tests are failing due to incorrect timed durations, increase the tolerance amount.
 */
const NETWORK_REQUEST_DURATION_TOLERANCE = 200;

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all documents from paginated response", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, pagedResponses, undefined, {
			ref: getMasterRef(repositoryResponse),
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);
	const res = await client.dangerouslyGetAll();

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, pagedResponses, params.accessToken, {
			ref: params.ref as string,
			pageSize: 100,
			lang: params.lang,
		}),
	);

	const client = createTestClient(t);
	const res = await client.dangerouslyGetAll(params);

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});

test("includes default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" },
	};
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, pagedResponses, clientOptions.accessToken, {
			ref: clientOptions.ref as string,
			lang: clientOptions.defaultParams?.lang,
			pageSize: 100,
		}),
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.dangerouslyGetAll();

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});

test("merges params and default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" },
	};
	const params: prismic.BuildQueryURLArgs = {
		ref: "overridden-ref",
		lang: "fr-fr",
	};
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, pagedResponses, clientOptions.accessToken, {
			ref: params.ref,
			lang: params.lang,
			pageSize: 100,
		}),
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.dangerouslyGetAll(params);

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});

test("throttles requests past first page", async (t) => {
	const numPages = 3;
	const repositoryResponse = createRepositoryResponse();
	const pagedResponses = createQueryResponsePages({
		numPages,
		numDocsPerPage: 3,
	});
	const queryDuration = 200;

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(
			t,
			pagedResponses,
			undefined,
			{
				ref: getMasterRef(repositoryResponse),
				pageSize: 100,
			},
			queryDuration,
		),
	);

	const client = createTestClient(t);

	const startTime = Date.now();
	await client.dangerouslyGetAll();
	const endTime = Date.now();

	const totalTime = endTime - startTime;
	const minTime =
		numPages * queryDuration + (numPages - 1) * GET_ALL_QUERY_DELAY;
	const maxTime = minTime + NETWORK_REQUEST_DURATION_TOLERANCE;

	// The total time should be the amount of time it takes to resolve all
	// network requests in addition to a delay between requests (accounting for
	// some tolerance). The last request does not start an artificial delay.
	t.true(
		minTime <= totalTime && totalTime <= maxTime,
		`Total time should be between ${minTime}ms and ${maxTime}ms (inclusive), but was ${totalTime}ms`,
	);
});

test("does not throttle single page queries", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();
	const queryDuration = 200;

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(
			t,
			[queryResponse],
			undefined,
			{
				ref: getMasterRef(repositoryResponse),
				pageSize: 100,
			},
			queryDuration,
		),
	);

	const client = createTestClient(t);

	const startTime = Date.now();
	await client.dangerouslyGetAll();
	const endTime = Date.now();

	const totalTime = endTime - startTime;
	const minTime = queryDuration;
	const maxTime = minTime + NETWORK_REQUEST_DURATION_TOLERANCE;

	// The total time should only be the amount of time it takes to resolve the
	// network request (accounting for some tolerance). In other words, there is
	// no artificial delay in a single page `getAll` query.
	t.true(
		minTime <= totalTime && totalTime <= maxTime,
		`Total time should be between ${minTime}ms and ${maxTime}ms (inclusive), but was ${totalTime}ms`,
	);
});
