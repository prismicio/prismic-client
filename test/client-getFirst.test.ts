import test from "ava";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

import { createDocument } from "./__testutils__/createDocument";
import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns the first document from a response", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const doc1 = createDocument();
	const doc2 = createDocument();
	const queryResponse = createQueryResponse([doc1, doc2]);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			pageSize: 1,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getFirst();

	t.deepEqual(res, doc1);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};
	const doc1 = createDocument();
	const doc2 = createDocument();
	const queryResponse = createQueryResponse([doc1, doc2]);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], params.accessToken, {
			ref: params.ref as string,
			lang: params.lang,
			pageSize: 1,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getFirst(params);

	t.deepEqual(res, doc1);
});

test("includes default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" },
	};
	const doc1 = createDocument();
	const doc2 = createDocument();
	const queryResponse = createQueryResponse([doc1, doc2]);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], clientOptions.accessToken, {
			ref: clientOptions.ref as string,
			lang: clientOptions.defaultParams?.lang,
			pageSize: 1,
		}),
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.getFirst();

	t.deepEqual(res, doc1);
});

test("merges params and default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*", pageSize: 10 },
	};
	const params: prismic.BuildQueryURLArgs = {
		ref: "overridden-ref",
		lang: "fr-fr",
	};
	const doc1 = createDocument();
	const doc2 = createDocument();
	const queryResponse = createQueryResponse([doc1, doc2]);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(
			t,
			[queryResponse, queryResponse],
			clientOptions.accessToken,
			{
				ref: params.ref,
				lang: params.lang,
				pageSize: clientOptions.defaultParams?.pageSize,
			},
		),
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.getFirst(params);

	t.deepEqual(res, doc1);
});

test("ignores default pageSize=1 param if a page param is given", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const doc1 = createDocument();
	const doc2 = createDocument();
	const queryResponse = createQueryResponse([doc1, doc2]);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(
			t,
			[
				// The empty object represents the first page,
				// which is not used in the query.
				{},
				queryResponse,
			],
			undefined,
			{
				ref: getMasterRef(repositoryResponse),
				page: 2,
			},
		),
	);

	const client = createTestClient(t);
	const res = await client.getFirst({ page: 2 });

	t.deepEqual(res, doc1);
});

test("throws if no documents were returned", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse([]);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			pageSize: 1,
		}),
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => client.getFirst(), {
		instanceOf: prismic.PrismicError,
		message: /no documents were returned/i,
	});
});

test("is abortable with an AbortController", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
		}),
	);

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => {
			const controller = new AbortController();
			controller.abort();

			await client.getFirst({
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
