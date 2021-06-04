import test from "ava";
import { Response } from "node-fetch";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { getMasterRef } from "./__testutils__/getMasterRef";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("resolves a query", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse)
		})
	);

	const client = createTestClient(t);
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("includes params if provided", async t => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*"
	};
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], params.accessToken, {
			ref: params.ref as string,
			lang: params.lang
		})
	);

	const client = createTestClient(t);
	const res = await client.get(params);

	t.deepEqual(res, queryResponse);
});

test("includes default params if provided", async t => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*" }
	};
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], clientOptions.accessToken, {
			ref: clientOptions.ref as string,
			lang: clientOptions.defaultParams?.lang
		})
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("merges params and default params if provided", async t => {
	const clientOptions: prismic.ClientConfig = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: { lang: "*", page: 2 }
	};
	const params: prismic.BuildQueryURLArgs = {
		ref: "overridden-ref",
		lang: "fr-fr"
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
				lang: params.lang,
				page: clientOptions.defaultParams?.page
			}
		)
	);

	const client = createTestClient(t, clientOptions);
	const res = await client.get(params);

	t.deepEqual(res, queryResponse);
});

test("uses the cached mastger ref within the ref's ttl", async t => {
	const repositoryResponse1 = createRepositoryResponse();
	const repositoryResponse2 = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse1),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse1)
		})
	);

	const client = createTestClient(t);
	const res1 = await client.get();

	// We're setting the next repository metadata response to include a different ref.
	// Notice that we aren't setting a new query handler. The next query should
	// use the previous ref.
	server.use(createMockRepositoryHandler(t, repositoryResponse2));

	const res2 = await client.get();

	t.deepEqual(res1, queryResponse);
	t.deepEqual(res2, queryResponse);
});

test("uses a fresh master ref outside of the cached ref's ttl", async t => {
	const repositoryResponse1 = createRepositoryResponse();
	const repositoryResponse2 = createRepositoryResponse();
	const queryResponse1 = createQueryResponse();
	const queryResponse2 = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse1),
		createMockQueryHandler(t, [queryResponse1], undefined, {
			ref: getMasterRef(repositoryResponse1)
		})
	);

	const client = createTestClient(t);
	const res1 = await client.get();

	// We wait for the cached ref's TTL to expire.
	await new Promise(res => setTimeout(() => res(undefined), 5000));

	// We're setting the next repository metadata response to include a different ref.
	// We're also using a new query handler using the new master ref.
	server.use(
		createMockRepositoryHandler(t, repositoryResponse2),
		createMockQueryHandler(t, [queryResponse2], undefined, {
			ref: getMasterRef(repositoryResponse2)
		})
	);

	const res2 = await client.get();

	t.deepEqual(res1, queryResponse1);
	t.deepEqual(res2, queryResponse2);
});

test("supports ref thunk param", async t => {
	const queryResponse = createQueryResponse();
	const ref = "ref";

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, { ref })
	);

	const client = createTestClient(t, { ref: () => ref });
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("uses master ref if ref thunk param returns non-string value", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse)
		})
	);

	const client = createTestClient(t, { ref: () => undefined });
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("throws if access token is invalid", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();
	const ref = getMasterRef(repositoryResponse);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], "accessToken", { ref })
	);

	const client = createTestClient(t);

	try {
		await client.get();
	} catch (error) {
		t.true(/invalid access token/i.test(error.message));
		t.is(error.url, `${client.endpoint}/documents/search?ref=${ref}`);
		t.deepEqual(error.options, {});
		t.true(error.response instanceof Response);
		t.is(error.response.status, 401);
	}
});

test("throws if a non-200 or non-401 network error occurs", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();
	const ref = getMasterRef(repositoryResponse);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(
			t,
			[queryResponse],
			undefined,
			{
				// We are forcing a 404 error by not matching the `ref` param.
				ref: "non-existant-ref"
			},
			// We're turning off debug support since we are intentionally creating a
			// mismatched handler.
			false
		)
	);

	const client = createTestClient(t);

	try {
		await client.get();
	} catch (error) {
		t.true(/status code 404/i.test(error.message));
		t.is(error.url, `${client.endpoint}/documents/search?ref=${ref}`);
		t.deepEqual(error.options, {});
		t.true(error.response instanceof Response);
		t.is(error.response.status, 404);
	}
});
