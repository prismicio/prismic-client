import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";
import * as sinon from "sinon";
import { Response, Headers } from "node-fetch";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryEndpoint } from "./__testutils__/createQueryEndpoint";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createRef } from "./__testutils__/createRef";
import { createRepositoryEndpoint } from "./__testutils__/createRepositoryEndpoint";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test.serial("createClient creates a Client", (t) => {
	const client = prismic.createClient("qwerty", {
		fetch: sinon.stub(),
	});

	t.true(client instanceof prismic.Client);
});

test.serial("creates a client with a repository name", (t) => {
	const repositoryName = "qwerty";
	const client = prismic.createClient(repositoryName, {
		fetch: sinon.stub(),
	});

	t.is(client.endpoint, prismic.getRepositoryEndpoint(repositoryName));
});

test.serial("creates a client with a Rest API V2 endpoint", (t) => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const client = prismic.createClient(endpoint, {
		fetch: sinon.stub(),
	});

	t.is(client.endpoint, endpoint);
});

test.serial("client has correct default state", (t) => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const options: prismic.ClientConfig = {
		accessToken: "accessToken",
		ref: "ref",
		fetch: async () => new Response(),
		defaultParams: {
			lang: "*",
		},
	};
	const client = prismic.createClient(endpoint, options);

	t.is(client.endpoint, endpoint);
	t.is(client.accessToken, options.accessToken);
	t.is(client.fetchFn, options.fetch as prismic.FetchLike);
	t.is(client.defaultParams, options.defaultParams);
});

test.serial(
	"constructor throws if an invalid repository name is provided",
	(t) => {
		t.throws(
			() => {
				prismic.createClient("invalid repository name", {
					fetch: sinon.stub(),
				});
			},
			{
				instanceOf: prismic.PrismicError,
				message: /an invalid Prismic repository name was given/i,
			},
		);
	},
);

test.serial(
	"constructor throws if an invalid repository endpoint is provided",
	(t) => {
		t.throws(
			() => {
				prismic.createClient("https://invalid url.cdn.prismic.io/api/v2", {
					fetch: sinon.stub(),
				});
			},
			{
				instanceOf: prismic.PrismicError,
				message: /an invalid Prismic repository name was given/i,
			},
		);
	},
);

test.serial("constructor throws if fetch is unavailable", (t) => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");

	t.throws(() => prismic.createClient(endpoint), {
		instanceOf: prismic.PrismicError,
		message: /fetch implementation was not provided/,
	});
});

test.serial("constructor throws if provided fetch is not a function", (t) => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const fetch = "not a function";

	t.throws(
		() =>
			prismic.createClient(endpoint, {
				// We wouldn't normally test for input types since TypeScript handles
				// that for us at build time, but we want to provide a nicer DX for
				// non-TypeScript users.
				// @ts-expect-error - We are purposly providing an invalid type to test if it throws.
				fetch,
			}),
		{
			instanceOf: prismic.PrismicError,
			message: /fetch implementation was not provided/,
		},
	);
});

test.serial("uses globalThis.fetch if available", async (t) => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const responseBody = { foo: "bar" };

	const existingFetch = globalThis.fetch;

	globalThis.fetch = async () =>
		// @ts-expect-error - node-fetch does not implement the full Response interface
		new Response(JSON.stringify(responseBody));

	const client = prismic.createClient(endpoint);
	const fetchResponse = await client.fetchFn("");
	const jsonResponse = await fetchResponse.json();

	t.deepEqual(jsonResponse, responseBody);

	globalThis.fetch = existingFetch;
});

test.serial("uses the master ref by default", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
		}),
	);

	const client = createTestClient(t);
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test.serial("supports manual string ref", async (t) => {
	const queryResponse = createQueryResponse();
	const ref = "ref";

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, { ref }),
	);

	const client = createTestClient(t, { ref });
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test.serial("supports manual thunk ref", async (t) => {
	const queryResponse = createQueryResponse();
	const ref = "ref";

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, { ref }),
	);

	const client = createTestClient(t, { ref: () => ref });
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test.serial(
	"uses master ref if ref thunk param returns non-string value",
	async (t) => {
		const repositoryResponse = createRepositoryResponse();
		const queryResponse = createQueryResponse();

		server.use(
			createMockRepositoryHandler(t, repositoryResponse),
			createMockQueryHandler(t, [queryResponse], undefined, {
				ref: getMasterRef(repositoryResponse),
			}),
		);

		const client = createTestClient(t, { ref: () => undefined });
		const res = await client.get();

		t.deepEqual(res, queryResponse);
	},
);

test.serial("uses browser preview ref if available", async (t) => {
	const previewRef = "previewRef";
	globalThis.document = {
		...globalThis.document,
		cookie: `io.prismic.preview=${previewRef}`,
	};

	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: previewRef,
		}),
	);

	const client = createTestClient(t);
	const res = await client.get();

	t.deepEqual(res, queryResponse);

	globalThis.document.cookie = "";
});

test.serial("uses req preview ref if available", async (t) => {
	const previewRef = "previewRef";
	const req = {
		headers: {
			cookie: `io.prismic.preview=${previewRef}`,
		},
	};

	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: previewRef,
		}),
	);

	const client = createTestClient(t);
	client.enableAutoPreviewsFromReq(req);
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test.serial("supports req with Web APIs", async (t) => {
	const previewRef = "previewRef";
	const headers = new Headers();
	headers.set("cookie", `io.prismic.preview=${previewRef}`);
	const req = {
		headers,
		url: "https://example.com",
	};

	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: previewRef,
		}),
	);

	const client = createTestClient(t);
	client.enableAutoPreviewsFromReq(req);
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test.serial(
	"does not use preview ref if auto previews are disabled",
	async (t) => {
		const previewRef = "previewRef";
		globalThis.document = {
			...globalThis.document,
			cookie: `io.prismic.preview=${previewRef}`,
		};

		t.teardown(() => {
			globalThis.document.cookie = "";
		});

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
				ref: getMasterRef(repositoryResponse),
			}),
		);
		client.disableAutoPreviews();
		const resWithoutPreviews = await client.get();

		t.deepEqual(resWithoutPreviews, queryResponseWithoutPreviews);

		// Enable previews and ensure the preview ref is being used.
		server.use(
			createMockQueryHandler(t, [queryResponseWithPreviews], undefined, {
				ref: previewRef,
			}),
		);
		client.enableAutoPreviews();
		const resWithPreviews = await client.get();

		t.deepEqual(resWithPreviews, queryResponseWithPreviews);
	},
);

test.serial(
	"uses the integration fields ref if the repository provides it",
	async (t) => {
		const repositoryResponse = createRepositoryResponse({
			integrationFieldsRef: createRef().ref,
		});
		const queryResponse = createQueryResponse();

		server.use(
			createMockRepositoryHandler(t, repositoryResponse),
			createMockQueryHandler(t, [queryResponse], undefined, {
				ref: getMasterRef(repositoryResponse),
				integrationFieldsRef: repositoryResponse.integrationFieldsRef,
			}),
		);

		const client = createTestClient(t);
		const res = await client.get();

		t.deepEqual(res, queryResponse);
	},
);

test.serial("uses client-provided routes in queries", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	const routes = [
		{
			type: "page",
			path: "/",
		},
	];

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			routes: JSON.stringify(routes),
		}),
	);

	const client = createTestClient(t, { routes });
	const res = await client.get();

	t.deepEqual(res, queryResponse);
});

test.serial(
	"throws ForbiddenError if access token is invalid for repository metadata",
	async (t) => {
		const repositoryResponse = {
			message: "invalid access token",
			oauth_initiate: "oauth_initiate",
			oauth_token: "oauth_token",
		};

		server.use(
			msw.rest.get(createRepositoryEndpoint(t), (_req, res, ctx) => {
				return res(ctx.status(401), ctx.json(repositoryResponse));
			}),
		);

		const client = createTestClient(t);

		await t.throwsAsync(async () => await client.getRepository(), {
			instanceOf: prismic.ForbiddenError,
			message: /invalid access token/i,
		});
	},
);

test.serial(
	"throws ForbiddenError if access token is invalid for query",
	async (t) => {
		const repositoryResponse = createRepositoryResponse();
		const queryResponse = {
			error: "invalid access token",
			oauth_initiate: "oauth_initiate",
			oauth_token: "oauth_token",
		};

		server.use(
			createMockRepositoryHandler(t, repositoryResponse),
			msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
				return res(ctx.status(403), ctx.json(queryResponse));
			}),
		);

		const client = createTestClient(t);

		await t.throwsAsync(async () => await client.get(), {
			instanceOf: prismic.ForbiddenError,
			message: /invalid access token/i,
		});
	},
);

test.serial(
	"throws PrismicError if response code is 403 but is not an invalid access token error",
	async (t) => {
		const repositoryResponse = createRepositoryResponse();
		const queryResponse = {};

		server.use(
			createMockRepositoryHandler(t, repositoryResponse),
			msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
				return res(ctx.status(403), ctx.json(queryResponse));
			}),
		);

		const client = createTestClient(t);

		await t.throwsAsync(async () => await client.get(), {
			instanceOf: prismic.PrismicError,
		});
	},
);

test.serial(
	"throws ParsingError if response code is 400 with parsing-error type",
	async (t) => {
		const repositoryResponse = createRepositoryResponse();
		const queryResponse = {
			type: "parsing-error",
			message: "message",
			line: 0,
			column: 1,
			id: 2,
			location: 3,
		};

		server.use(
			createMockRepositoryHandler(t, repositoryResponse),
			msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
				return res(ctx.status(400), ctx.json(queryResponse));
			}),
		);

		const client = createTestClient(t);

		await t.throwsAsync(async () => await client.get(), {
			instanceOf: prismic.ParsingError,
			message: queryResponse.message,
		});
	},
);

test.serial(
	"throws PrismicError if response code is 400 but is not a parsing error",
	async (t) => {
		const repositoryResponse = createRepositoryResponse();
		const queryResponse = {};

		server.use(
			createMockRepositoryHandler(t, repositoryResponse),
			msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
				return res(ctx.status(400), ctx.json(queryResponse));
			}),
		);

		const client = createTestClient(t);

		await t.throwsAsync(async () => await client.get(), {
			instanceOf: prismic.PrismicError,
		});
	},
);

test.serial(
	"throws PrismicError if response is not 200, 400, 403, or 404",
	async (t) => {
		const repositoryResponse = createRepositoryResponse();

		server.use(
			createMockRepositoryHandler(t, repositoryResponse),
			msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
				return res(ctx.status(418), ctx.json({}));
			}),
		);

		const client = createTestClient(t);

		await t.throwsAsync(async () => await client.get(), {
			instanceOf: prismic.PrismicError,
			message: /invalid api response/i,
		});
	},
);

test.serial("throws PrismicError if response is not JSON", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(200));
		}),
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.PrismicError,
		message: /invalid api response/i,
	});
});

test.serial("throws NotFoundError if repository does not exist", async (t) => {
	server.use(
		msw.rest.get(createRepositoryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(404));
		}),
		msw.rest.get(createQueryEndpoint(t), (_req, res, ctx) => {
			return res(ctx.status(404));
		}),
	);

	const client = createTestClient(t);

	await t.throwsAsync(async () => await client.get(), {
		instanceOf: prismic.NotFoundError,
		message: /repository not found/i,
	});
});

test.serial(
	"throws if a prismic.io endpoint is given that is not for Rest API V2",
	(t) => {
		const fetch = sinon.stub();

		const originalNodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";

		t.throws(
			() => {
				prismic.createClient("https://qwerty.cdn.prismic.io/api/v1", { fetch });
			},
			{
				message: /only supports Prismic Rest API V2/,
				instanceOf: prismic.PrismicError,
			},
		);

		t.notThrows(() => {
			prismic.createClient("https://example.com/custom/endpoint", { fetch });
		}, "Non-prismic.io endpoints are not checked");

		t.notThrows(() => {
			prismic.createClient("https://qwerty.cdn.prismic.io/api/v2", { fetch });
		}, "A valid prismic.io V2 endpoint does not throw");

		t.notThrows(() => {
			prismic.createClient(prismic.getRepositoryEndpoint("qwerty"), { fetch });
		}, "An endpoint created with getRepositoryEndpoint does not throw");

		process.env.NODE_ENV === originalNodeEnv;
	},
);
