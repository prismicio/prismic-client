import test from "ava";

import * as prismic from "../src";

const endpoint = prismic.getEndpoint("qwerty");

test("includes ref", (t) => {
	t.is(
		prismic.buildQueryURL(endpoint, { ref: "ref" }),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref",
	);
});

test("supports single predicate", (t) => {
	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				predicates: prismic.predicate.has("my.document.title"),
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&q=[[has(my.document.title)]]",
	);
});

test("supports multiple predicates", (t) => {
	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				predicates: [
					prismic.predicate.has("my.document.title"),
					prismic.predicate.has("my.document.subtitle"),
				],
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&q=[[has(my.document.title)]]&q=[[has(my.document.subtitle)]]",
	);
});

test("supports params", (t) => {
	t.is(
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
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&access_token=accessToken&pageSize=1&page=1&after=after&fetch=fetch&fetchLinks=fetchLinks&graphQuery=graphQuery&lang=lang&orderings=[orderings]&routes=routes",
	);
});

test("ignores nullish params", (t) => {
	t.is(
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
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref",
	);
});

test("supports array fetch param", (t) => {
	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				fetch: ["title", "subtitle"],
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&fetch=title,subtitle",
	);
});

test("supports array fetchLinks param", (t) => {
	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				fetchLinks: ["page.link", "page.second_link"],
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&fetchLinks=page.link,page.second_link",
	);
});

test("supports empty orderings param", (t) => {
	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: "",
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[]",
	);

	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: [],
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[]",
	);
});

test("supports array orderings param", (t) => {
	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: ["page.title", { field: "page.subtitle" }],
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle]",
	);
});

test("supports setting direction of ordering param", (t) => {
	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: ["page.title", { field: "page.subtitle", direction: "asc" }],
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle]",
	);

	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				orderings: [
					"page.title",
					{ field: "page.subtitle", direction: "desc" },
				],
			}),
		),
		"https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&orderings=[page.title,page.subtitle+desc]",
	);
});

test("supports single item routes param", (t) => {
	const route = {
		type: "type",
		path: "path",
		resolvers: { foo: "bar" },
	};

	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				routes: route,
			}),
		),
		`https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&routes=[${JSON.stringify(
			route,
		)}]`,
	);
});

test("supports array routes param", (t) => {
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

	t.is(
		decodeURIComponent(
			prismic.buildQueryURL(endpoint, {
				ref: "ref",
				routes: routes,
			}),
		),
		`https://qwerty.cdn.prismic.io/api/v2/documents/search?ref=ref&routes=${JSON.stringify(
			routes,
		)}`,
	);
});
