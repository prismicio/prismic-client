import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";
import * as crypto from "crypto";
import AbortController from "abort-controller";

import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";
import { createAuthorizationHeader } from "./__testutils__/createAuthorizationHeader";
import { createRef } from "./__testutils__/createRef";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

// TODO: Remove in v3
test("graphqlFetch() is a temporary alias to graphQLFetch()", (t) => {
	const client = createTestClient(t);

	t.deepEqual(client.graphqlFetch, client.graphQLFetch);
});

test("resolves a query", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const graphqlURL = `https://${repositoryName}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse)) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	const res = await client.graphQLFetch(graphqlURL);
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});

test("merges provided headers with defaults", async (t) => {
	const repositoryResponse = createRepositoryResponse({
		integrationFieldsRef: createRef(false).ref,
	});
	const ref = "custom-ref";

	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const graphqlURL = `https://${repositoryName}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.headers.get("Prismic-Ref") === ref &&
				req.headers.get("Prismic-integration-field-ref") ===
					repositoryResponse.integrationFieldsRef
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	const res = await client.graphQLFetch(graphqlURL, {
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

	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const graphqlURL = `https://${repositoryName}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse) &&
				req.headers.get("Prismic-integration-field-ref") ===
					repositoryResponse.integrationFieldsRef
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	const res = await client.graphQLFetch(graphqlURL);
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});

test("includes Integration Fields header if ref is available", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const accessToken = "accessToken";

	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const graphqlURL = `https://${repositoryName}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse) &&
				req.headers.get("Authorization") ===
					createAuthorizationHeader(accessToken)
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t, { accessToken });
	const res = await client.graphQLFetch(graphqlURL);
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});

test("optimizes queries by removing whitespace", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const graphQLEndpoint = `https://${repositoryName}.cdn.prismic.io/graphql`;

	const graphqlURLWithUncompressedQuery = new URL(graphQLEndpoint);
	graphqlURLWithUncompressedQuery.searchParams.set(
		"query",
		`query {
  allPage {
    edges {
      node {
        _meta {
          uid
        }
      }
    }
  }
}`,
	);

	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphQLEndpoint, (req, res, ctx) => {
			if (
				req.url.searchParams.get("query") ===
					"query{allPage{edges{node{_meta{uid}}}}}" &&
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse)
			) {
				t.pass();

				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	await client.graphQLFetch(graphqlURLWithUncompressedQuery.toString());

	t.plan(1);
});

test("includes a ref URL parameter to cache-bust", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const ref = getMasterRef(repositoryResponse);

	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const graphQLEndpoint = `https://${repositoryName}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		msw.rest.get(graphQLEndpoint, (req, res, ctx) => {
			if (
				req.url.searchParams.get("ref") === ref &&
				req.headers.get("Prismic-Ref") === ref
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient(t);
	const res = await client.graphQLFetch(graphQLEndpoint);
	const json = await res.json();

	t.deepEqual(json, graphqlResponse);
});

test("is abortable with an AbortController", async (t) => {
	const repositoryResponse = createRepositoryResponse();

	server.use(createMockRepositoryHandler(t, repositoryResponse));

	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const graphqlURL = `https://${repositoryName}.cdn.prismic.io/graphql`;

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => {
			const controller = new AbortController();
			controller.abort();

			await client.graphQLFetch(graphqlURL, {
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
