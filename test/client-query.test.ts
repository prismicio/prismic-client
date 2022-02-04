import test from "ava";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

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

test("resolves a query", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			q: `[[at(document.type, "page")]]`,
		}),
	);

	const client = createTestClient(t);
	const res = await client.query(prismic.predicate.at("document.type", "page"));

	t.deepEqual(res, queryResponse);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		integrationFieldsRef: "custom-integration-fields-ref",
		lang: "*",
	};
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], params.accessToken, {
			ref: params.ref as string,
			integrationFieldsRef: params.integrationFieldsRef,
			q: `[[at(document.type, "page")]]`,
			lang: params.lang,
		}),
	);

	const client = createTestClient(t);
	const res = await client.query(
		prismic.predicate.at("document.type", "page"),
		params,
	);

	t.deepEqual(res, queryResponse);
});

test("includes default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" },
	};
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], clientOptions.accessToken, {
			ref: clientOptions.ref as string,
			q: `[[at(document.type, "page")]]`,
			lang: clientOptions.defaultParams?.lang,
		}),
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.query(prismic.predicate.at("document.type", "page"));

	t.deepEqual(res, queryResponse);
});

test("merges params and default params if provided", async (t) => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*", page: 2 },
	};
	const params: prismic.BuildQueryURLArgs = {
		ref: "overridden-ref",
		lang: "fr-fr",
	};
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(
			t,
			[queryResponse, queryResponse],
			clientOptions.accessToken,
			{
				ref: params.ref,
				q: `[[at(document.type, "page")]]`,
				lang: params.lang,
				page: clientOptions.defaultParams?.page,
			},
		),
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.query(
		prismic.predicate.at("document.type", "page"),
		params,
	);

	t.deepEqual(res, queryResponse);
});

test("is abortable with an AbortController", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	server.use(createMockRepositoryHandler(t, repositoryResponse));

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => {
			const controller = new AbortController();
			controller.abort();

			await client.query([], {
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
