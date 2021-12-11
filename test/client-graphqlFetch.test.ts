import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";
import { createAuthorizationHeader } from "./__testutils__/createAuthorizationHeader";
import { createRef } from "./__testutils__/createRef";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("resolves a query", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	const graphqlURL = "https://example.com/";
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.toString() === graphqlURL &&
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse)
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	const res = await client.graphqlFetch(graphqlURL);
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});

test("merges provided headers with defaults", async (t) => {
	const repositoryResponse = createRepositoryResponse({
		integrationFieldsRef: createRef(false).ref,
	});
	const ref = "custom-ref";

	const graphqlURL = "https://example.com/";
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.toString() === graphqlURL &&
				req.headers.get("Prismic-Ref") === ref &&
				req.headers.get("Prismic-integration-field-ref") ===
					repositoryResponse.integrationFieldsRef
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	const res = await client.graphqlFetch(graphqlURL, {
		headers: {
			"Prismic-Ref": ref,
		},
	});
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});

test("includes Authorization header if access token is provided", async (t) => {
	const repositoryResponse = createRepositoryResponse({
		integrationFieldsRef: createRef(false).ref,
	});

	const graphqlURL = "https://example.com/";
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.toString() === graphqlURL &&
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse) &&
				req.headers.get("Prismic-integration-field-ref") ===
					repositoryResponse.integrationFieldsRef
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	const res = await client.graphqlFetch(graphqlURL);
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});

test("includes Integration Fields header if ref is available", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const accessToken = "accessToken";

	const graphqlURL = "https://example.com/";
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.toString() === graphqlURL &&
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse) &&
				req.headers.get("Authorization") ===
					createAuthorizationHeader(accessToken)
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t, { accessToken });
	const res = await client.graphqlFetch(graphqlURL);
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});
