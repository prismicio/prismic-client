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

it("accepts an endpoint", ({ expect }) => {
	const client = createClient("https://example.cdn.prismic.io/api/v2")
	expect(client.repositoryName).toBe("example")
	expect(client.documentAPIEndpoint).toBe(
		"https://example.cdn.prismic.io/api/v2",
	)
})

it("throws when given an invalid repository name", ({ expect }) => {
	const fn = () => createClient("invalid name")
	expect(fn).toThrow(PrismicError)
	expect(fn).toThrow(/invalid prismic repository name/i)
})

it("throws when given an invalid endpoint", ({ expect }) => {
	const fn = () => createClient("https://invalid url.cdn.prismic.io/api/v2")
	expect(fn).toThrow(PrismicError)
	expect(fn).toThrow(/invalid prismic repository name/i)
})

it("throws in development when given an incompatible endpoint", ({
	expect,
}) => {
	vi.stubEnv("NODE_ENV", "development")
	const invalid = () => createClient("https://example.cdn.prismic.io/api/v1")
	expect(invalid).toThrow(PrismicError)
	expect(invalid).toThrow(/only supports prismic rest api v2/i)
	expect(() => createClient("https://example.com/custom")).not.toThrow()
	vi.unstubAllEnvs()
})

it("warns in development when given a non-CDN endpoint", ({ expect }) => {
	vi.stubEnv("NODE_ENV", "development")
	createClient("https://example.prismic.io/api/v2")
	expect(console.warn).toBeCalledWith(
		expect.stringMatching(/endpoint-must-use-cdn/i),
	)
	vi.mocked(console.warn).mockClear()
	createClient("https://example.com/custom")
	expect(console.warn).not.toBeCalledWith(
		expect.stringMatching(/endpoint-must-use-cdn/i),
	)
	createClient("https://example.cdn.prismic.io/api/v2")
	expect(console.warn).not.toBeCalledWith(
		expect.stringMatching(/endpoint-must-use-cdn/i),
	)
	vi.unstubAllEnvs()
})

it("warns in development when endpoint and documentAPIEndpoint option don't match", ({
	expect,
}) => {
	vi.stubEnv("NODE_ENV", "development")
	createClient("https://foo.cdn.prismic.io/api/v2", {
		documentAPIEndpoint: "https://bar.prismic.io/api/v2",
	})
	expect(console.warn).toBeCalledWith(
		expect.stringMatching(/prefer-repository-name/i),
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
	expect(invalid).toThrow(PrismicError)
	expect(invalid).toThrow(/fetch implementation was not provided/i)
	vi.unstubAllGlobals()
})

it("throws if given fetch is not a function", ({ expect }) => {
	vi.stubGlobal("fetch", undefined)
	const invalid = () =>
		// @ts-expect-error - Intentional wrong type
		createClient("example", { fetch: "invalid" })
	expect(invalid).toThrow(PrismicError)
	expect(invalid).toThrow(/fetch implementation was not provided/i)
	vi.unstubAllGlobals()
})
