import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";
import * as sinon from "sinon";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";
import { createQueryEndpoint } from "./__testutils__/createQueryEndpoint";

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
	t.is(client.fetchFn, options.fetch);
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

test("supports manual string ref", async t => {
	const queryResponse = createQueryResponse();
	const ref = "ref";

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, { ref })
	);

	const client = createTestClient(t, { ref });
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test("uses the master ref by default", async t => {
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

test("supports manual thunk ref", async t => {
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

test("uses browser preview ref if available", async t => {
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

		const repositoryResponse = createRepositoryResponse();
		const queryResponseWithoutPreviews = createQueryResponse();
		const queryResponseWithPreviews = createQueryResponse();

		server.use(createMockRepositoryHandler(t, repositoryResponse));

		const client = createTestClient(t);

		// Disable auto previews and ensure the default ref is being used. Note that
		// the global cookie has already been set by this point, which should be
		// ignored by the client.
		server.use(
			createMockQueryHandler(t, [queryResponseWithoutPreviews], undefined, {
				ref: getMasterRef(repositoryResponse)
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

test("throws ForbiddenError if access token is invalid", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = {
		error: "invalid access token",
		oauth_initiate: "oauth_initiate",
		oauth_token: "oauth_token"
	};

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(403), ctx.json(queryResponse));
		})
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.ForbiddenError,
		message: /invalid access token/i
	});
});

test("throws PrismicError if response code is 404 but is not an invalid access token error", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = {};

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(403), ctx.json(queryResponse));
		})
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.PrismicError
	});
});

test("throws ParsingError if response code is 400 with parsing-error type", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = {
		type: "parsing-error",
		message: "message",
		line: 0,
		column: 1,
		id: 2,
		location: 3
	};

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(400), ctx.json(queryResponse));
		})
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.ParsingError,
		message: queryResponse.message
	});
});

test("throws PrismicError if response code is 400 but is not a parsing error", async t => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = {};

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(400), ctx.json(queryResponse));
		})
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.PrismicError
	});
});

test("throws PrismicError if response is not 200, 400, or 403", async t => {
	const repositoryResponse = createRepositoryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(404), ctx.json({}));
		})
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.PrismicError,
		message: /invalid api response/i
	});
});

test("throws PrismicError if response is not JSON", async t => {
	const repositoryResponse = createRepositoryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(200));
		})
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.PrismicError,
		message: /invalid api response/i
	});
});