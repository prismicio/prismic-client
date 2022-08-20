import { it, expect, vi } from "vitest";
import { Response, Headers } from "node-fetch";
import * as msw from "msw";
import * as prismicM from "@prismicio/mock";

import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

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

	const originalFetch = globalThis.fetch;
	// @ts-expect-error - Forcing fetch to be undefined
	delete globalThis.fetch;

	expect(() => prismic.createClient(endpoint)).toThrowError(
		/fetch implementation was not provided/i,
	);
	expect(() => prismic.createClient(endpoint)).toThrowError(
		prismic.PrismicError,
	);

	globalThis.fetch = originalFetch;
});

it("constructor throws if provided fetch is not a function", () => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");
	const fetch = "not a function";

	// Unset global fetch to ensure the client won't fall back to the global implementation.
	const originalFetch = globalThis.fetch;
	// @ts-expect-error - Forcing fetch to be undefined
	delete globalThis.fetch;

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

	globalThis.fetch = originalFetch;
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

	mockPrismicRestAPIV2({
		queryResponse,
		ctx,
	});

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
		ctx,
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
		ctx,
	});

	const client = createTestClient({ clientConfig: { ref: () => ref } });
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("uses master ref if ref thunk param returns non-string value", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: getMasterRef(repositoryResponse) },
		ctx,
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
		ctx,
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
		ctx,
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
		ctx,
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

	const repositoryResponse = ctx.mock.api.repository();
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: getMasterRef(repositoryResponse) },
		ctx,
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

	const repositoryResponse = ctx.mock.api.repository();
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	const client = createTestClient();

	// Disable auto previews and ensure the default ref is being used. Note that
	// the global cookie has already been set by this point, which should be
	// ignored by the client.
	client.disableAutoPreviews();
	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: getMasterRef(repositoryResponse) },
		ctx,
	});

	const res1 = await client.get();

	expect(res1).toStrictEqual(queryResponse);

	// Enable previews and ensure the preview ref is being used.
	client.enableAutoPreviews();
	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: { ref: previewRef },
		ctx,
	});

	const resWithPreviews = await client.get();

	expect(resWithPreviews).toStrictEqual(queryResponse);

	globalThis.document.cookie = "";
});

it("uses the integration fields ref if the repository provides it", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.integrationFieldsRef = ctx.mock.api.ref().ref;
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: getMasterRef(repositoryResponse),
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			integrationFieldsRef: repositoryResponse.integrationFieldsRef!,
		},
		ctx,
	});

	const client = createTestClient();
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("ignores the integration fields ref if the repository provides a null value", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.integrationFieldsRef = null;
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	mockPrismicRestAPIV2({
		repositoryResponse,
		queryResponse,
		queryRequiredParams: {
			ref: getMasterRef(repositoryResponse),
		},
		ctx,
	});

	const client = createTestClient();
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("uses client-provided routes in queries", async (ctx) => {
	const queryResponse = prismicM.api.query({ seed: ctx.meta.name });

	const routes: prismic.Route[] = [
		{
			type: "page",
			path: "/:uid",
		},
		{
			type: "page",
			uid: "home",
			path: "/",
		},
		{
			brokenRoute: "/404",
		},
	];

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			routes: JSON.stringify(routes),
		},
		ctx,
	});

	const client = createTestClient({ clientConfig: { routes } });
	const res = await client.get();

	expect(res).toStrictEqual(queryResponse);
});

it("throws ForbiddenError if access token is invalid for repository metadata", async (ctx) => {
	mockPrismicRestAPIV2({
		accessToken: "token",
		ctx,
	});

	const client = createTestClient();

	await expect(() => client.getRepository()).rejects.toThrowError(
		/invalid access token/i,
	);
	await expect(() => client.getRepository()).rejects.toThrowError(
		prismic.ForbiddenError,
	);
});

it("throws ForbiddenError if access token is invalid for query", async (ctx) => {
	mockPrismicRestAPIV2({
		accessToken: "token",
		ctx,
	});

	const client = createTestClient();

	await expect(() => client.get()).rejects.toThrowError(
		/invalid access token/i,
	);
	await expect(() => client.get()).rejects.toThrowError(prismic.ForbiddenError);
});

it("throws ForbiddenError if response code is 403", async (ctx) => {
	const queryResponse = {
		error: "Invalid access token",
	};

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	ctx.server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(403), ctx.json(queryResponse));
		}),
	);

	let error: prismic.ForbiddenError | undefined;

	try {
		await client.get();
	} catch (e) {
		if (e instanceof prismic.ForbiddenError) {
			error = e;
		}
	}

	expect(error?.message).toBe(queryResponse.error);
});

it("throws ParsingError if response code is 400 with parsing-error type", async (ctx) => {
	const queryResponse = {
		type: "parsing-error",
		message: "message",
		line: 0,
		column: 1,
		id: 2,
		location: 3,
	};

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	ctx.server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(400), ctx.json(queryResponse));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(queryResponse.message);
	await expect(() => client.get()).rejects.toThrowError(prismic.ParsingError);
});

it("throws PrismicError if response code is 400 but is not a parsing error", async (ctx) => {
	const queryResponse = {};

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	ctx.server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(400), ctx.json(queryResponse));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(prismic.PrismicError);
});

it("throws PrismicError if response is not 200, 400, 401, 403, or 404", async (ctx) => {
	const queryResponse = {};

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	ctx.server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(418), ctx.json(queryResponse));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(
		/invalid api response/i,
	);
	await expect(() => client.get()).rejects.toThrowError(prismic.PrismicError);
});

it("throws PrismicError if response is not JSON", async (ctx) => {
	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();

	const queryEndpoint = new URL(
		"documents/search",
		`${client.endpoint}/`,
	).toString();

	ctx.server.use(
		msw.rest.get(queryEndpoint, (_req, res, ctx) => {
			return res(ctx.status(200));
		}),
	);

	await expect(() => client.get()).rejects.toThrowError(
		/invalid api response/i,
	);
	await expect(() => client.get()).rejects.toThrowError(prismic.PrismicError);
});

it("throws NotFoundError if repository does not exist", async (ctx) => {
	const client = createTestClient();

	ctx.server.use(
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
