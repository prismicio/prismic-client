import { vi } from "vitest"

import { it } from "./it"

import { Client, PrismicError, createClient } from "../src"

it("returns a Client", ({ expect }) => {
	const client = createClient("example")
	expect(client).toBeInstanceOf(Client)
})

it("accepts a repository name", ({ expect }) => {
	const client = createClient("example")
	expect(client.repositoryName).toBe("example")
	expect(client.documentAPIEndpoint).toBe(
		"https://example.cdn.prismic.io/api/v2",
	)
})

// TODO: Remove in v8 when endpoints are not supported as the first argument.
it("accepts an endpoint", ({ expect }) => {
	const client = createClient("https://example.cdn.prismic.io/api/v2")
	expect(client.repositoryName).toBe("example")
	expect(client.documentAPIEndpoint).toBe(
		"https://example.cdn.prismic.io/api/v2",
	)
})

it("supports a custom endpoint", ({ expect }) => {
	const client = createClient("example", {
		documentAPIEndpoint: "https://example.com/custom",
	})
	expect(client.repositoryName).toBe("example")
	expect(client.documentAPIEndpoint).toBe("https://example.com/custom")
})

it("throws when given an invalid repository name", ({ expect }) => {
	const fn = () => createClient("invalid name")
	expect(fn).toThrow(PrismicError)
	expect(fn).toThrow(/invalid prismic repository name/i)
})

it("throws when given an invalid endpoint", ({ expect }) => {
	const fn = () =>
		createClient("example", {
			documentAPIEndpoint: "https://invalid url.cdn.prismic.io/api/v2",
		})
	expect(fn).toThrow(TypeError)
	expect(fn).toThrow(/not a valid url/i)
})

it("throws in development when given an incompatible endpoint", ({
	expect,
}) => {
	vi.stubEnv("NODE_ENV", "development")
	const invalid = () =>
		createClient("example", {
			documentAPIEndpoint: "https://example.cdn.prismic.io/api/v1",
		})
	expect(invalid).toThrow(TypeError)
	expect(invalid).toThrow(/only supports content api/i)
	vi.unstubAllEnvs()
})

it("warns in development when given a non-CDN endpoint", ({ expect }) => {
	vi.stubEnv("NODE_ENV", "development")
	createClient("example", {
		documentAPIEndpoint: "https://example.prismic.io/api/v2",
	})
	expect(console.warn).toBeCalledWith(
		expect.stringMatching(/endpoint-must-use-cdn/i),
	)
	vi.mocked(console.warn).mockClear()
	createClient("example", {
		documentAPIEndpoint: "https://example.com/custom",
	})
	expect(console.warn).not.toBeCalledWith(
		expect.stringMatching(/endpoint-must-use-cdn/i),
	)
	createClient("example", {
		documentAPIEndpoint: "https://example.cdn.prismic.io/api/v2",
	})
	expect(console.warn).not.toBeCalledWith(
		expect.stringMatching(/endpoint-must-use-cdn/i),
	)
	vi.unstubAllEnvs()
})

it("warns in development when a repository name cannot be inferred from an endpoint", ({
	expect,
}) => {
	vi.stubEnv("NODE_ENV", "development")
	createClient("https://example.com/custom")
	expect(console.warn).toBeCalledWith(
		expect.stringMatching(/prefer-repository-name/i),
	)
	vi.unstubAllEnvs()
})

it("uses global fetch by default", async ({ expect }) => {
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue("foo"))
	const client = createClient("example")
	const res = await client.fetchFn("https://example.com")
	expect(res).toBe("foo")
	vi.unstubAllGlobals()
})

it("throws if fetch is unavailable", ({ expect }) => {
	vi.stubGlobal("fetch", undefined)
	const invalid = () => createClient("example")
	expect(invalid).toThrow(TypeError)
	expect(invalid).toThrow(/a fetch implementation must be provided/i)
	vi.unstubAllGlobals()
})

it("accepts a custom fetch", async ({ expect }) => {
	const fetch = vi.fn()
	const client = createClient("example", { fetch })
	expect(client.fetch).toBe(fetch)
})

it("throws if given fetch is not a function", ({ expect }) => {
	vi.stubGlobal("fetch", undefined)
	const invalid = () =>
		// @ts-expect-error - Intentional wrong type
		createClient("example", { fetch: "invalid" })
	expect(invalid).toThrow(TypeError)
	expect(invalid).toThrow(/fetch must be a function/i)
	vi.unstubAllGlobals()
})

it("supports routes", async ({ expect, repository, endpoint, docs }) => {
	const client = createClient(repository.name, {
		documentAPIEndpoint: endpoint,
		routes: [{ type: docs.default.type, path: "/:uid" }],
	})
	vi.spyOn(client, "fetch")
	await client.get()
	expect(client).toHaveLastFetchedContentAPI({
		routes: `[{"type":"${docs.default.type}","path":"/:uid"}]`,
	})
})
