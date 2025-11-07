import { vi } from "vitest"

import { it } from "./it"

it("performs a graphql query", async ({ expect, client, endpoint }) => {
	const input = new URL("/graphql", endpoint)
	input.searchParams.set("query", "{_allDocuments{totalCount}}")
	const res = await client.graphQLFetch(input.toString())
	const json = await res.json()
	expect(json).toHaveProperty("data")
})

it("includes prismic-ref header with master ref", async ({
	expect,
	client,
	endpoint,
	masterRef,
}) => {
	const input = new URL("/graphql", endpoint)
	input.searchParams.set("query", "{_allDocuments{totalCount}}")
	await client.graphQLFetch(input.toString())
	const init = vi.mocked(client.fetchFn).mock.lastCall![1]!
	expect(init.headers).toHaveProperty("prismic-ref", masterRef)
})

it("supports access token", async ({
	expect,
	client,
	endpoint,
	accessToken,
}) => {
	const input = new URL("/graphql", endpoint)
	input.searchParams.set("query", "{_allDocuments{totalCount}}")
	client.accessToken = accessToken
	await client.graphQLFetch(input.toString())
	const init = vi.mocked(client.fetchFn).mock.lastCall![1]!
	expect(init.headers).toHaveProperty("authorization", `Token ${accessToken}`)
})

it("supports custom headers", async ({
	expect,
	client,
	endpoint,
	masterRef,
}) => {
	const input = new URL("/graphql", endpoint)
	input.searchParams.set("query", "{_allDocuments{totalCount}}")
	await client.graphQLFetch(input.toString(), { headers: { foo: "bar" } })
	const init = vi.mocked(client.fetchFn).mock.lastCall![1]!
	expect(init.headers).toHaveProperty("prismic-ref", masterRef)
	expect(init.headers).toHaveProperty("foo", "bar")
})

it("includes ref URL parameter for cache-busting", async ({
	expect,
	client,
	endpoint,
	masterRef,
}) => {
	const input = new URL("/graphql", endpoint)
	input.searchParams.set("query", "{_allDocuments{totalCount}}")
	await client.graphQLFetch(input.toString())
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).toHaveSearchParam("ref", masterRef)
})

it("optimizes queries by removing whitespace", async ({
	expect,
	client,
	endpoint,
}) => {
	const input = new URL("/graphql", endpoint)
	input.searchParams.set(
		"query",
		`{
  _allDocuments {
    totalCount
  }
}
`.trim(),
	)
	await client.graphQLFetch(input.toString())
	const url = vi.mocked(client.fetchFn).mock.lastCall![0]
	expect(url).toHaveSearchParam("query", "{_allDocuments{totalCount}}")
})

it("supports signal", async ({ expect, client }) => {
	await expect(() =>
		client.graphQLFetch("https://foo.cdn.prismic.io/graphql", {
			signal: AbortSignal.abort(),
		}),
	).rejects.toThrow()
})

it("does not share concurrent equivalent network requests", async ({
	expect,
	client,
	endpoint,
}) => {
	const input = new URL("/graphql", endpoint)
	input.searchParams.set("query", "{_allDocuments{totalCount}}")
	await Promise.all([
		client.graphQLFetch(input.toString()),
		client.graphQLFetch(input.toString()),
	])
	expect(client).toHaveFetchedRepoTimes(1)
	const graphqlCalls = vi
		.mocked(client.fetchFn)
		.mock.calls.filter(([url]) => new URL(url).pathname === "/graphql")
	expect(graphqlCalls).toHaveLength(2)
})
