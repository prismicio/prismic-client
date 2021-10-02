import test from "ava";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponsePages } from "./__testutils__/createQueryResponsePages";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";
import { GET_ALL_THROTTLE_THRESHOLD } from "../src/client";
import { createQueryResponse } from "./__testutils__/createQueryResponse";

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
	const res = await client.getAll();

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
	const res = await client.getAll(params);

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
	const res = await client.getAll();

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
	const res = await client.getAll(params);

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

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, pagedResponses, undefined, {
			ref: getMasterRef(repositoryResponse),
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);

	const startTime = Date.now();
	await client.getAll();
	const endTime = Date.now();

	const totalTime = endTime - startTime;
	const maxTime = numPages * GET_ALL_THROTTLE_THRESHOLD;
	const minTime = maxTime - GET_ALL_THROTTLE_THRESHOLD;

	// The total time should be between (# of pages - 1) and # of pages
	// multiplied by the throttle threshold duration. This effectively checks
	// that each request after page 1 is delayed by at least the threshold
	// amount.
	t.true(
		minTime <= totalTime && totalTime <= maxTime,
		`Total time should be between ${minTime}ms and ${maxTime}ms (inclusive), but was ${totalTime}ms`,
	);
});

test("does not throttle single page queries", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);

	const startTime = Date.now();
	await client.getAll();
	const endTime = Date.now();

	const totalTime = endTime - startTime;

	// The total time should be less than throttle threshold duration. This
	// effectively checks that the first request is called immediately and does
	// not unnecessarily wait after the request is fulfilled.
	t.true(
		totalTime < GET_ALL_THROTTLE_THRESHOLD,
		`Total time should be less than ${GET_ALL_THROTTLE_THRESHOLD}ms, but was ${totalTime}ms`,
	);
});
