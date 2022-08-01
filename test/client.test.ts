import { it, expect, beforeAll, afterAll, vi } from "vitest";
import * as msw from "msw";
import * as mswNode from "msw/node";
import { Response, Headers } from "node-fetch";
import * as prismicM from "@prismicio/mock";

import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRef } from "./__testutils__/createRef";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

it("createClient creates a Client", () => {
	const client = prismic.createClient("qwerty", {
		fetch: vi.fn(),
	});

	expect(client).toBeInstanceOf(prismic.Client);
});

it("creates a client with a repository name", () => {
	const repositoryName = "qwerty";
	const client = prismic.createClient(repositoryName, {
		fetch: vi.fn(),
	});

	expect(client.endpoint).toBe(prismic.getRepositoryEndpoint(repositoryName));
});

it("creates a client with a Rest API V2 endpoint", () => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const client = prismic.createClient(endpoint, {
		fetch: vi.fn(),
	});

	expect(client.endpoint).toBe(endpoint);
});

it("client has correct default state", () => {
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

	expect(client.endpoint).toBe(endpoint);
	expect(client.accessToken).toBe(options.accessToken);
	expect(client.fetchFn).toBe(options.fetch as prismic.FetchLike);
	expect(client.defaultParams).toBe(options.defaultParams);
});

it("constructor throws if an invalid repository name is provided", () => {
	expect(() => {
		prismic.createClient("invalid repository name", {
			fetch: vi.fn(),
		});
	}).toThrowError(/an invalid Prismic repository name was given/i);
	expect(() => {
		prismic.createClient("invalid repository name", {
			fetch: vi.fn(),
		});
	}).toThrowError(prismic.PrismicError);
});

it("constructor throws if an invalid repository endpoint is provided", () => {
	expect(() => {
		prismic.createClient("https://invalid url.cdn.prismic.io/api/v2", {
			fetch: vi.fn(),
		});
	}).toThrowError(/an invalid Prismic repository name was given/i);
	expect(() => {
		prismic.createClient("https://invalid url.cdn.prismic.io/api/v2", {
			fetch: vi.fn(),
		});
	}).toThrowError(prismic.PrismicError);
});

it("constructor throws if fetch is unavailable", () => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");

	expect(() => prismic.createClient(endpoint)).toThrowError(
		/fetch implementation was not provided/i,
	);
	expect(() => prismic.createClient(endpoint)).toThrowError(
		prismic.PrismicError,
	);
});

it("constructor throws if provided fetch is not a function", () => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const fetch = "not a function";

	expect(() =>
		prismic.createClient(endpoint, {
			// We wouldn't normally test for input types since TypeScript handles
			// that for us at build time, but we want to provide a nicer DX for
			// non-TypeScript users.
			// @ts-expect-error - We are purposly providing an invalid type to test if it throws.
			fetch,
		}),
	).toThrowError(/fetch implementation was not provided/i);
	expect(() =>
		prismic.createClient(endpoint, {
			// We wouldn't normally test for input types since TypeScript handles
			// that for us at build time, but we want to provide a nicer DX for
			// non-TypeScript users.
			// @ts-expect-error - We are purposly providing an invalid type to test if it throws.
			fetch,
		}),
	).toThrowError(prismic.PrismicError);
});

it("uses globalThis.fetch if available", async () => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const responseBody = { foo: "bar" };

	const existingFetch = globalThis.fetch;

	globalThis.fetch = async () =>
		// @ts-expect-error - node-fetch does not implement the full Response interface
		new Response(JSON.stringify(responseBody));

	const client = prismic.createClient(endpoint);
	const fetchResponse = await client.fetchFn("");
	const jsonResponse = await fetchResponse.json();

	expect(jsonResponse).toStrictEqual(responseBody);

	globalThis.fetch = existingFetch;
});

it("uses the master ref by default", async (ctx) => {
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({ queryResponse, server });

	const client = createTestClient();
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("supports manual string ref", async (ctx) => {
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });
	const ref = "ref";

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: { ref },
		server,
	});

	const client = createTestClient({ clientConfig: { ref } });
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("supports manual thunk ref", async (ctx) => {
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });
	const ref = "ref";

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: { ref },
		server,
	});

	const client = createTestClient({ clientConfig: { ref: () => ref } });
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("uses master ref if ref thunk param returns non-string value", async (ctx) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: getMasterRef(repositoryResponse) },
		server,
	});

	const client = createTestClient({ clientConfig: { ref: () => undefined } });
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("uses browser preview ref if available", async (ctx) => {
	const previewRef = "previewRef";
	globalThis.document = {
		...globalThis.document,
		cookie: `io.prismic.preview=${previewRef}`,
	};

	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: { ref: previewRef },
		server,
	});

	const client = createTestClient();
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);

	globalThis.document.cookie = "";
});

it("uses req preview ref if available", async (ctx) => {
	const previewRef = "previewRef";
	const req = {
		headers: {
			cookie: `io.prismic.preview=${previewRef}`,
		},
	};

	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: { ref: previewRef },
		server,
	});

	const client = createTestClient();
	client.enableAutoPreviewsFromReq(req);
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("supports req with Web APIs", async (ctx) => {
	const previewRef = "previewRef";
	const headers = new Headers();
	headers.set("cookie", `io.prismic.preview=${previewRef}`);
	const req = {
		headers,
		url: "https://example.com",
	};

	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: { ref: previewRef },
		server,
	});

	const client = createTestClient();
	client.enableAutoPreviewsFromReq(req);
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("ignores req without cookies", async (ctx) => {
	const req = {
		headers: {},
	};

	const repositoryResponse = createRepositoryResponse();
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: getMasterRef(repositoryResponse) },
		server,
	});

	const client = createTestClient();
	client.enableAutoPreviewsFromReq(req);
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("does not use preview ref if auto previews are disabled", async (ctx) => {
	const previewRef = "previewRef";
	globalThis.document = {
		...globalThis.document,
		cookie: `io.prismic.preview=${previewRef}`,
	};

	const repositoryResponse = createRepositoryResponse();
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	const client = createTestClient();

	// Disable auto previews and ensure the default ref is being used. Note that
	// the global cookie has already been set by this point, which should be
	// ignored by the client.
	client.disableAutoPreviews();
	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: getMasterRef(repositoryResponse) },
		server,
	});

	const res1 = await client.get();

	expect(res1).toStrictEqual(queryResponse);

	// Enable previews and ensure the preview ref is being used.
	client.enableAutoPreviews();
	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: previewRef },
		server,
	});

	const resWithPreviews = await client.get();

	expect(resWithPreviews).toStrictEqual(queryResponse);

	globalThis.document.cookie = "";
});

it("uses the integration fields ref if the repository provides it", async (ctx) => {
	const repositoryResponse = createRepositoryResponse({
		integrationFieldsRef: createRef().ref,
	});
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: getMasterRef(repositoryResponse),
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			integrationFieldsRef: repositoryResponse.integrationFieldsRef!,
		},
		server,
	});

	const client = createTestClient();
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("uses client-provided routes in queries", async (ctx) => {
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	const routes = [
		{
			type: "page",
			path: "/",
		},
	];

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			routes: JSON.stringify(routes),
		},
		server,
	});

	const client = createTestClient({ clientConfig: { routes } });
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("throws ForbiddenError if access token is invalid for repository metadata", async () => {
	mockPrismicRestAPIV2({
		accessToken: "token",
		server,
	});

	const client = createTestClient();

	await expect(() => client.getRepository()).rejects.toThrowError(
		/invalid access token/i,
	);
	await expect(() => client.getRepository()).rejects.toThrowError(
		prismic.ForbiddenError,
	);
});

it("throws ForbiddenError if access token is invalid for query", async () => {
	mockPrismicRestAPIV2({
		accessToken: "token",
		server,
	});

	const client = createTestClient();

	await expect(() => client.get()).rejects.toThrowError(
		/invalid access token/i,
	);
	await expect(() => client.get()).rejects.toThrowError(prismic.ForbiddenError);
});

it("throws PrismicError if response code is 403 but is not an invalid access token error", async () => {
	const queryResponse = {};

	mockPrismicRestAPIV2({ server });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(403), ctx.json(queryResponse));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(prismic.PrismicError);
});

it("throws ParsingError if response code is 400 with parsing-error type", async () => {
	const queryResponse = {
		type: "parsing-error",
		message: "message",
		line: 0,
		column: 1,
		id: 2,
		location: 3,
	};

	mockPrismicRestAPIV2({ server });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(400), ctx.json(queryResponse));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(queryResponse.message);
	await expect(() => client.get()).rejects.toThrowError(prismic.ParsingError);
});

it("throws PrismicError if response code is 400 but is not a parsing error", async () => {
	const queryResponse = {};

	mockPrismicRestAPIV2({ server });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(400), ctx.json(queryResponse));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(prismic.PrismicError);
});

it("throws PrismicError if response is not 200, 400, 403, or 404", async () => {
	const queryResponse = {};

	mockPrismicRestAPIV2({ server });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(418), ctx.json(queryResponse));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(
		/invalid api response/i,
	);
	await expect(() => client.get()).rejects.toThrowError(prismic.PrismicError);
});

it("throws PrismicError if response is not JSON", async () => {
	mockPrismicRestAPIV2({ server });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(200));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(
		/invalid api response/i,
	);
	await expect(() => client.get()).rejects.toThrowError(prismic.PrismicError);
});

it("throws NotFoundError if repository does not exist", async () => {
	const client = createTestClient();

	server.use(
		msw.rest.get(client.endpoint, (_req, res, ctx) => {
			return res(ctx.status(404));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(
		/repository not found/i,
	);
	await expect(() => client.get()).rejects.toThrowError(prismic.NotFoundError);
});

it("throws if a prismic.io endpoint is given that is not for Rest API V2", () => {
	const fetch = vi.fn();

	const originalNodeEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = "development";

	expect(() => {
		prismic.createClient("https://qwerty.cdn.prismic.io/api/v1", { fetch });
	}).toThrowError(/only supports Prismic Rest API V2/i);
	expect(() => {
		prismic.createClient("https://qwerty.cdn.prismic.io/api/v1", { fetch });
	}).toThrowError(prismic.PrismicError);

	expect(() => {
		prismic.createClient("https://example.com/custom/endpoint", { fetch });
	}, "Non-prismic.io endpoints are not checked").not.toThrow();

	expect(() => {
		prismic.createClient("https://qwerty.cdn.prismic.io/api/v2", { fetch });
	}, "A valid prismic.io V2 endpoint does not throw").not.toThrow();

	expect(() => {
		prismic.createClient(prismic.getRepositoryEndpoint("qwerty"), { fetch });
	}, "An endpoint created with getRepositoryEndpoint does not throw").not.toThrow();

	process.env.NODE_ENV === originalNodeEnv;
});
