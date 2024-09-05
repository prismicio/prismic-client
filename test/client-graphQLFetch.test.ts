import { expect, it } from "vitest"

import * as msw from "msw"

import { createAuthorizationHeader } from "./__testutils__/createAuthorizationHeader"
import { createTestClient } from "./__testutils__/createClient"
import { createRepositoryName } from "./__testutils__/createRepositoryName"
import { getMasterRef } from "./__testutils__/getMasterRef"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"

it("resolves a query", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	const graphqlURL = `https://${createRepositoryName(ctx)}.cdn.prismic.io/graphql`
	const graphqlResponse = { foo: "bar" }

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})
	ctx.server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse)) {
				return res(ctx.json(graphqlResponse))
			}
		}),
	)

	const client = createTestClient({ ctx })
	const res = await client.graphQLFetch(graphqlURL)
	const json = await res.json()

	expect(json).toStrictEqual(graphqlResponse)
})

it("merges provided headers with defaults", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	repositoryResponse.integrationFieldsRef = ctx.mock.api.ref().ref
	const ref = "custom-ref"

	const graphqlURL = `https://${createRepositoryName(ctx)}.cdn.prismic.io/graphql`
	const graphqlResponse = { foo: "bar" }

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})
	ctx.server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.headers.get("Prismic-Ref") === ref &&
				req.headers.get("Prismic-integration-field-ref") ===
					repositoryResponse.integrationFieldsRef
			) {
				return res(ctx.json(graphqlResponse))
			}
		}),
	)

	const client = createTestClient({ ctx })
	const res = await client.graphQLFetch(graphqlURL, {
		headers: {
			"Prismic-Ref": ref,
		},
	})
	const json = await res.json()

	expect(json).toStrictEqual(graphqlResponse)
})

// TODO: This test doesn't seem to test what the description claims.
it("includes Authorization header if access token is provided", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	repositoryResponse.integrationFieldsRef = ctx.mock.api.ref().ref

	const graphqlURL = `https://${createRepositoryName(ctx)}.cdn.prismic.io/graphql`
	const graphqlResponse = { foo: "bar" }

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})
	ctx.server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse) &&
				req.headers.get("Prismic-integration-field-ref") ===
					repositoryResponse.integrationFieldsRef
			) {
				return res(ctx.json(graphqlResponse))
			}
		}),
	)

	const client = createTestClient({ ctx })
	const res = await client.graphQLFetch(graphqlURL)
	const json = await res.json()

	expect(json).toStrictEqual(graphqlResponse)
})

// TODO: This test doesn't seem to test what the description claims.
it("includes integration fields header if ref is available", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	const accessToken = "accessToken"

	const graphqlURL = `https://${createRepositoryName(ctx)}.cdn.prismic.io/graphql`
	const graphqlResponse = { foo: "bar" }

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})
	ctx.server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse) &&
				req.headers.get("Authorization") ===
					createAuthorizationHeader(accessToken)
			) {
				return res(ctx.json(graphqlResponse))
			}
		}),
	)

	const client = createTestClient({ clientConfig: { accessToken }, ctx })
	const res = await client.graphQLFetch(graphqlURL)
	const json = await res.json()

	expect(json).toStrictEqual(graphqlResponse)
})

it("optimizes queries by removing whitespace", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()

	const graphqlURL = `https://${createRepositoryName(ctx)}.cdn.prismic.io/graphql`
	const graphqlResponse = { foo: "bar" }

	const graphqlURLWithUncompressedQuery = new URL(graphqlURL)
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
	)

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})
	ctx.server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.searchParams.get("query") ===
					"query{allPage{edges{node{_meta{uid}}}}}" &&
				req.headers.get("Prismic-Ref") === getMasterRef(repositoryResponse)
			) {
				return res(ctx.json(graphqlResponse))
			}
		}),
	)

	const client = createTestClient({ ctx })
	const res = await client.graphQLFetch(
		graphqlURLWithUncompressedQuery.toString(),
	)
	const json = await res.json()

	expect(json).toStrictEqual(graphqlResponse)
})

it("includes a ref URL parameter to cache-bust", async (ctx) => {
	const repositoryResponse = ctx.mock.api.repository()
	const ref = getMasterRef(repositoryResponse)

	const graphqlURL = `https://${createRepositoryName(ctx)}.cdn.prismic.io/graphql`
	const graphqlResponse = { foo: "bar" }

	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	})
	ctx.server.use(
		msw.rest.get(graphqlURL, (req, res, ctx) => {
			if (
				req.url.searchParams.get("ref") === ref &&
				req.headers.get("Prismic-Ref") === ref
			) {
				return res(ctx.json(graphqlResponse))
			}
		}),
	)

	const client = createTestClient({ ctx })
	const res = await client.graphQLFetch(graphqlURL)
	const json = await res.json()

	expect(json).toStrictEqual(graphqlResponse)
})

// `graphQLFetch()` uses a different function signature from query methods, so
// we cannot use the generalized `testAbortableMethod()` test util.
it("is abortable with an AbortController", async (ctx) => {
	const controller = new AbortController()
	controller.abort()

	mockPrismicRestAPIV2({ ctx })

	const client = createTestClient({ ctx })

	await expect(async () => {
		await client.graphQLFetch("https://foo.cdn.prismic.io/graphql", {
			signal: controller.signal,
		})
	}).rejects.toThrow(/aborted/i)
})

testConcurrentMethod("does not share concurrent equivalent network requests", {
	run: (client, params) =>
		client.graphQLFetch(
			`https://${client.repositoryName}.cdn.prismic.io/graphql`,
			params,
		),
	mode: "NOT-SHARED___graphQL",
})
