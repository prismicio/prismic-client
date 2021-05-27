import test from "ava";
import * as mswNode from "msw/node";
import * as sinon from "sinon";

import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("createClient creates a Client", t => {
	const endpoint = prismic.getEndpoint("qwerty");
	const client = prismic.createClient(endpoint, {
		fetch: sinon.stub()
	});

	t.true(client instanceof prismic.Client);
});

test("client has correct default state", t => {
	const endpoint = prismic.getEndpoint("qwerty");
	const options: prismic.ClientConfig = {
		accessToken: "accessToken",
		ref: "ref",
		fetch: async () => new Response(),
		defaultParams: {
			lang: "*"
		}
	};
	const client = prismic.createClient(endpoint, options);

	t.is(client.endpoint, endpoint);
	t.is(client.accessToken, options.accessToken);
	t.is(client.ref, options.ref);
	t.is(client.fetchFn, options.fetch);
	t.is(client.httpRequest, undefined);
	t.is(client.defaultParams, options.defaultParams);
});

test("constructor throws if fetch is unavailable", t => {
	const endpoint = prismic.getEndpoint("qwerty");

	t.throws(() => prismic.createClient(endpoint), {
		message: /fetch implementation was not provided/
	});
});

test("uses globalThis.fetch if available", t => {
	const endpoint = prismic.getEndpoint("qwerty");

	const existingFetch = globalThis.fetch;

	globalThis.fetch = async () => new Response();

	t.notThrows(() => prismic.createClient(endpoint));

	globalThis.fetch = existingFetch;
});

// This test must be serial since it mutates globalThis.
test.serial("uses browser preview ref if available", async t => {
	const previewRef = "previewRef";
	globalThis.document = {
		...globalThis.document,
		cookie: `io.prismic.preview=${previewRef}`
	};

	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: previewRef
		})
	);

	const client = createTestClient(t);
	const res = await client.get();

	t.deepEqual(res, queryResponse);

	globalThis.document.cookie = "";
});

// This test must be serial since it could be affected by tests that mutate
// globalThis.
test.serial("uses req preview ref if available", async t => {
	const previewRef = "previewRef";
	const req = {
		headers: {
			cookie: `io.prismic.preview=${previewRef}`
		}
	};

	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: previewRef
		})
	);

	const client = createTestClient(t);
	client.enableAutoPreviewsFromReq(req);
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

// This test must be serial since it mutates globalThis.
test.serial(
	"does not use preview ref if auto previews are disabled",
	async t => {
		const previewRef = "previewRef";
		globalThis.document = {
			...globalThis.document,
			cookie: `io.prismic.preview=${previewRef}`
		};

		const queryResponseWithoutPreviews = createQueryResponse();
		const queryResponseWithPreviews = createQueryResponse();

		server.use(createMockRepositoryHandler(t));

		const client = createTestClient(t);

		// Disable auto previews and ensure the default ref is being used. Note that
		// the global cookie has already been set by this point, which should be
		// ignored by the client.
		server.use(
			createMockQueryHandler(t, [queryResponseWithoutPreviews], undefined, {
				ref: "masterRef"
			})
		);
		client.disableAutoPreviews();
		const resWithoutPreviews = await client.get();

		t.deepEqual(resWithoutPreviews, queryResponseWithoutPreviews);

		// Enable previews and ensure the preview ref is being used.
		server.use(
			createMockQueryHandler(t, [queryResponseWithPreviews], undefined, {
				ref: previewRef
			})
		);
		client.enableAutoPreviews();
		const resWithPreviews = await client.get();

		t.deepEqual(resWithPreviews, queryResponseWithPreviews);

		globalThis.document.cookie = "";
	}
);
