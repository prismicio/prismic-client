import { expect, it, vi } from "vitest"

import * as prismic from "../src"

const endpoint = prismic.getRepositoryEndpoint("qwerty")

it("includes ref", () => {
	expect(prismic.buildQueryURL(endpoint, { ref: "ref" })).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref",
	)
})

it("supports single filter", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				filters: prismic.filter.has("my.document.title"),
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?q=[[has(my.document.title)]]&ref=ref",
	)

	// TODO: Remove when we remove support for deprecated `predicates` argument.
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				predicates: prismic.predicate.has("my.document.title"),
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?q=[[has(my.document.title)]]&ref=ref",
	)
})

it("supports multiple filters", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				filters: [
					prismic.filter.has("my.document.title"),
					prismic.filter.has("my.document.subtitle"),
				],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?q=[[has(my.document.title)]]&q=[[has(my.document.subtitle)]]&ref=ref",
	)

	// TODO: Remove when we remove support for deprecated `predicates` argument.
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				predicates: [
					prismic.predicate.has("my.document.title"),
					prismic.predicate.has("my.document.subtitle"),
				],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?q=[[has(my.document.title)]]&q=[[has(my.document.subtitle)]]&ref=ref",
	)
})

it("supports params", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				accessToken: "accessToken",
				pageSize: 1,
				page: 1,
				after: "after",
				fetch: "fetch",
				fetchLinks: "fetchLinks",
				graphQuery: "graphQuery",
				lang: "lang",
				orderings: [{ field: "orderings" }],
				routes: "routes",
				brokenRoute: "brokenRoute",
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&access_token=accessToken&pageSize=1&page=1&after=after&fetch=fetch&fetchLinks=fetchLinks&graphQuery=graphQuery&lang=lang&orderings=[orderings]&routes=routes&brokenRoute=brokenRoute",
	)
})

it("ignores nullish params", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				accessToken: undefined,
				pageSize: undefined,
				page: undefined,
				after: undefined,
				fetch: undefined,
				fetchLinks: undefined,
				graphQuery: undefined,
				lang: undefined,
				orderings: undefined,
			}),
		),
	).toBe("https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref")
})

it("supports array fetch param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				fetch: ["title", "subtitle"],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&fetch=title,subtitle",
	)
})

it("supports array fetchLinks param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				fetchLinks: ["page.link", "page.second_link"],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&fetchLinks=page.link,page.second_link",
	)
})

it("supports empty orderings param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				// TODO: Remove test with deprecated API in v8
				orderings: "",
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[]",
	)

	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: [],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[]",
	)
})

it("supports array orderings param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				// TODO: Remove test with deprecated API in v8
				orderings: ["page.title", { field: "page.subtitle" }],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle]",
	)
})

it("supports setting direction of ordering param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				// TODO: Remove test with deprecated API in v8
				orderings: ["page.title", { field: "page.subtitle", direction: "asc" }],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle]",
	)

	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: [
					// TODO: Remove test with deprecated API in v8
					"page.title desc",
					{ field: "page.subtitle", direction: "desc" },
				],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title+desc,page.subtitle+desc]",
	)
})

it("supports single item routes param", () => {
	const route = {
		type: "type",
		path: "path",
		resolvers: { foo: "bar" },
	}

	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				routes: route,
			}),
		),
	).toBe(
		`https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&routes=[${JSON.stringify(
			route,
		)}]`,
	)
})

it("supports array routes param", () => {
	const routes: prismic.Route[] = [
		{
			type: "foo",
			path: "foo-path",
			resolvers: { foo: "bar" },
		},
		{
			type: "bar",
			path: "bar-path",
			resolvers: { foo: "bar" },
		},
	]

	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				routes: routes,
			}),
		),
	).toBe(
		`https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&routes=${JSON.stringify(
			routes,
		)}`,
	)
})

it("warns if NODE_ENV is development and a string is provided to `orderings`", () => {
	const originalEnv = { ...process.env }

	process.env.NODE_ENV = "development"

	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0)

	prismic.buildQueryURL(endpoint, {
		ref: "ref",
		orderings: "orderings",
	})

	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/orderings-must-be-an-array-of-objects/i),
	)

	consoleWarnSpy.mockRestore()

	process.env = originalEnv
})

it("warns if NODE_ENV is development and an array of strings is provided to `orderings`", () => {
	const originalEnv = { ...process.env }

	process.env.NODE_ENV = "development"

	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0)

	prismic.buildQueryURL(endpoint, {
		ref: "ref",
		orderings: ["orderings"],
	})

	prismic.buildQueryURL(endpoint, {
		ref: "ref",
		orderings: ["orderings desc"],
	})

	expect(consoleWarnSpy).toHaveBeenNthCalledWith(
		2,
		expect.stringMatching(/orderings-must-be-an-array-of-objects/i),
	)

	consoleWarnSpy.mockRestore()

	process.env = originalEnv
})

it("warns if NODE_ENV is development and a string is provided to `filters`", () => {
	const originalEnv = { ...process.env }

	process.env.NODE_ENV = "development"

	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0)

	prismic.buildQueryURL(endpoint, {
		ref: "ref",
		filters: "filters",
	})

	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/filters-must-be-an-array/i),
	)

	consoleWarnSpy.mockRestore()

	process.env = originalEnv
})
