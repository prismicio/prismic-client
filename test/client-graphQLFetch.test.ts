import { it, expect, beforeAll, afterAll } from "vitest";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";
import { createAuthorizationHeader } from "./__testutils__/createAuthorizationHeader";
import { createRef } from "./__testutils__/createRef";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { createRepositoryName } from "./__testutils__/createRepositoryName";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

// TODO: Remove in v7
it.fails("graphqlFetch() is a temporary alias to graphQLFetch()", () => {
	const client = createTestClient();

	expect(client.graphqlFetch).toBe(client.graphQLFetch);
});

it("resolves a query", async () => {
	const repositoryResponse = createRepositoryResponse();
	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server,
	});
	server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse)) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient();
	const res = await client.graphQLFetch(graphqlURL);
	const json = await res.json();

	expect(json).toStrictEqual(graphqlResponse);
});

it("merges provided headers with defaults", async () => {
	const repositoryResponse = createRepositoryResponse({
		integrationFieldsRef: createRef(false).ref,
	});
	const ref = "custom-ref";

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server,
	});
	server.use(
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

	const client = createTestClient();
	const res = await client.graphQLFetch(graphqlURL, {
		headers: {
			"Prismic-Ref": ref,
		},
	});
	const json = await res.json();

	expect(json).toStrictEqual(graphqlResponse);
});

it("includes Authorization header if access token is provided", async () => {
	const repositoryResponse = createRepositoryResponse({
		integrationFieldsRef: createRef(false).ref,
	});

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server,
	});
	server.use(
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

	const client = createTestClient();
	const res = await client.graphQLFetch(graphqlURL);
	const json = await res.json();

	expect(json).toStrictEqual(graphqlResponse);
});

it("includes Integration Fields header if ref is available", async () => {
	const repositoryResponse = createRepositoryResponse();
	const accessToken = "accessToken";

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server,
	});
	server.use(
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

	const client = createTestClient({ clientConfig: { accessToken } });
	const res = await client.graphQLFetch(graphqlURL);
	const json = await res.json();

	expect(json).toStrictEqual(graphqlResponse);
});

it("optimizes queries by removing whitespace", async () => {
	const repositoryResponse = createRepositoryResponse();

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	const graphqlURLWithUncompressedQuery = new URL(graphqlURL);
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

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server,
	});
	server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.searchParams.get("query") ===
					"query{allPage{edges{node{_meta{uid}}}}}" &&
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse)
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient();
	const res = await client.graphQLFetch(
		graphqlURLWithUncompressedQuery.toString(),
	);
	const json = await res.json();

	expect(json).toStrictEqual(graphqlResponse);
});

it("includes a ref URL parameter to cache-bust", async () => {
	const repositoryResponse = createRepositoryResponse();
	const ref = getMasterRef(repositoryResponse);

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryHandler: () => repositoryResponse,
		server,
	});
	server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.searchParams.get("ref") === ref &&
				req.headers.get("Prismic-Ref") === ref
			) {
				return res(ctx.json(graphqlResponse));
			}
		}),
	);

	const client = createTestClient();
	const res = await client.graphQLFetch(graphqlURL);
	const json = await res.json();

	expect(json).toStrictEqual(graphqlResponse);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) =>
		client.graphQLFetch("https://foo.cdn.prismic.io/graphql", {
			signal,
		}),
	server,
});
