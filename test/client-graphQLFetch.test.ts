import { it, expect } from "vitest";
import * as msw from "msw";

import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";
import { createAuthorizationHeader } from "./__testutils__/createAuthorizationHeader";
import { createRepositoryName } from "./__testutils__/createRepositoryName";

it("resolves a query", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});
	ctx.server.use(
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

it("merges provided headers with defaults", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.integrationFieldsRef = ctx.mock.api.ref().ref;
	const ref = "custom-ref";

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});
	ctx.server.use(
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

it("includes Authorization header if access token is provided", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.integrationFieldsRef = ctx.mock.api.ref().ref;

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});
	ctx.server.use(
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

it("includes Integration Fields header if ref is available", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	const accessToken = "accessToken";

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});
	ctx.server.use(
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

it("optimizes queries by removing whitespace", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();

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
		repositoryResponse,
		ctx,
	});
	ctx.server.use(
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

it("includes a ref URL parameter to cache-bust", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository();
	const ref = getMasterRef(repositoryResponse);

	const graphqlURL = `https://${createRepositoryName()}.cdn.prismic.io/graphql`;
	const graphqlResponse = { foo: "bar" };

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});
	ctx.server.use(
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

// `graphQLFetch()` uses a different function signature from query methods, so
// we cannot use the generalized `testAbortableMethod()` test util.
it("is abortable with an AbortController", async (ctx) => {
	const controller = new AbortController();
	controller.abort();

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();

	await expect(async () => {
		await client.graphQLFetch("https://foo.cdn.prismic.io/graphql", {
			signal: controller.signal,
		});
	}).rejects.toThrow(/aborted/i);
});
