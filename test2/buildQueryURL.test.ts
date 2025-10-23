import { describe, vi } from "vitest"

import { version } from "../package.json"

import { it } from "./it"

import { buildQueryURL } from "../src"

it("creates a Content API URL", async ({ expect, endpoint }) => {
	const res = new URL(buildQueryURL(endpoint, { ref: "foo" }))
	expect(res.origin).toBe(new URL(endpoint).origin)
	expect(res.pathname).toBe(new URL("documents/search", endpoint).pathname)
})

it("includes ref", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, { ref: "foo" })
	expect(res).toHaveSearchParam("ref", "foo")
})

it("supports access token", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		accessToken: "accessToken",
	})
	expect(res).toHaveSearchParam("access_token", "accessToken")
})

it("supports page size", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		pageSize: 1,
	})
	expect(res).toHaveSearchParam("pageSize", "1")
})

it("supports page", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		page: 2,
	})
	expect(res).toHaveSearchParam("page", "2")
})

it("supports after", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		after: "after",
	})
	expect(res).toHaveSearchParam("after", "after")
})

it("supports single filter", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		filters: "[has(my.document.title)]",
	})
	expect(res).toHaveSearchParam("q", "[[has(my.document.title)]]")
})

it("supports multiple filters", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		filters: ["[has(my.document.title)]", "[has(my.document.subtitle)]"],
	})
	expect(res).toHaveSearchParam("q", "[[has(my.document.title)]]")
	expect(res).toHaveSearchParam("q", "[[has(my.document.subtitle)]]")
})

describe("fetch", () => {
	it("supports single fetch", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			fetch: "page.bar",
		})
		expect(res).toHaveSearchParam("fetch", "page.bar")
	})

	it("supports multiple fetch", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			fetch: ["page.bar", "page.baz"],
		})
		expect(res).toHaveSearchParam("fetch", "page.bar,page.baz")
	})
})

describe("fetchLinks", () => {
	it("supports single fetchLinks", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			fetchLinks: "page.foo",
		})
		expect(res).toHaveSearchParam("fetchLinks", "page.foo")
	})

	it("supports multiple fetchLinks", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			fetchLinks: ["page.bar", "page.baz"],
		})
		expect(res).toHaveSearchParam("fetchLinks", "page.bar,page.baz")
	})
})

it("supports graphQuery", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		graphQuery: "graphQuery",
	})
	expect(res).toHaveSearchParam("graphQuery", "graphQuery")
})

it("supports lang", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		lang: "lang",
	})
	expect(res).toHaveSearchParam("lang", "lang")
})

describe("orderings", () => {
	it("supports single ordering", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			orderings: { field: "foo" },
		})
		expect(res).toHaveSearchParam("orderings", "[foo]")
	})

	it("supports multiple orderings", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			orderings: [{ field: "foo" }, { field: "bar", direction: "desc" }],
		})
		expect(res).toHaveSearchParam("orderings", "[foo,bar desc]")
	})

	it("supports single string ordering", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			orderings: "foo",
		})
		expect(res).toHaveSearchParam("orderings", "[foo]")
	})
})

describe("routes", () => {
	it("supports single route", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			routes: { type: "page", path: "/:uid" },
		})
		expect(res).toHaveSearchParam("routes", '[{"type":"page","path":"/:uid"}]')
	})

	it("supports multiple routes", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			routes: [{ type: "page", path: "/:uid" }],
		})
		expect(res).toHaveSearchParam("routes", '[{"type":"page","path":"/:uid"}]')
	})

	it("supports single string route", async ({ expect, endpoint }) => {
		const res = buildQueryURL(endpoint, {
			ref: "foo",
			routes: '[{"type":"page","path":"/:uid"}]',
		})
		expect(res).toHaveSearchParam("routes", '[{"type":"page","path":"/:uid"}]')
	})
})

it("supports broken route", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, {
		ref: "foo",
		brokenRoute: "brokenRoute",
	})
	expect(res).toHaveSearchParam("brokenRoute", "brokenRoute")
})

it("includes x-c version parameter", async ({ expect, endpoint }) => {
	const res = buildQueryURL(endpoint, { ref: "foo" })
	expect(res).toHaveSearchParam("x-c", `js-${version}`)
})

it("includes x-d parameter in development", async ({ expect, endpoint }) => {
	vi.stubEnv("NODE_ENV", "development")
	const dev = buildQueryURL(endpoint, { ref: "foo" })
	expect(dev).toHaveSearchParam("x-d")
	vi.unstubAllEnvs()
	const prod = buildQueryURL(endpoint, { ref: "foo" })
	expect(prod).not.toHaveSearchParam("x-d")
})
