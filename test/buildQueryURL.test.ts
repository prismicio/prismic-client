import { it, expect } from "vitest";

import * as prismic from "../src";

const endpoint = prismic.getRepositoryEndpoint("qwerty");

it("includes ref", () => {
	expect(prismic.buildQueryURL(endpoint, { ref: "ref" })).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref",
	);
});

it("supports single predicate", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				predicates: prismic.predicate.has("my.document.title"),
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?q=[[has(my.document.title)]]&ref=ref",
	);
});

it("supports multiple predicates", () => {
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
	);
});

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
				orderings: "orderings",
				routes: "routes",
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&access_token=accessToken&pageSize=1&page=1&after=after&fetch=fetch&fetchLinks=fetchLinks&graphQuery=graphQuery&lang=lang&orderings=[orderings]&routes=routes",
	);
});

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
	).toBe("https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref");
});

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
	);
});

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
	);
});

it("supports empty orderings param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: "",
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[]",
	);

	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: [],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[]",
	);
});

it("supports array orderings param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: ["page.title", { field: "page.subtitle" }],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle]",
	);
});

it("supports setting direction of ordering param", () => {
	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: ["page.title", { field: "page.subtitle", direction: "asc" }],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle]",
	);

	expect(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: [
					"page.title",
					{ field: "page.subtitle", direction: "desc" },
				],
			}),
		),
	).toBe(
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle+desc]",
	);
});

it("supports single item routes param", () => {
	const route = {
		type: "type",
		path: "path",
		resolvers: { foo: "bar" },
	};

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
	);
});

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
	];

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
	);
});
