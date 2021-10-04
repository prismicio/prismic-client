import test from "ava";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponsePages } from "./__testutils__/createQueryResponsePages";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

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
			lang: params.lang,
			pageSize: 100,
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

test("uses the default pageSize when given a falsey pageSize param", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const pagedResponses = createQueryResponsePages({
		numPages: 1,
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

	// The following calls will implicitly fail the test if the
	// `createMockQueryHandler` handler does not match the given `pageSize` of
	// 100. This is handled within createMockQueryHandler (see the `debug` option).

	await client.getAll();
	await client.getAll({ pageSize: undefined });
	await client.getAll({ pageSize: 0 });
});
