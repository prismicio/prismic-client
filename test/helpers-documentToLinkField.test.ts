import { expect, it } from "vitest"

import { documentFixture } from "./__fixtures__/document"

import { LinkType, documentToLinkField } from "../src"

it("returns equivalent link field from given document", () => {
	const document = { ...documentFixture.empty, url: null }

	expect(documentToLinkField(document)).toStrictEqual({
		link_type: LinkType.Document,
		id: "XvoFFREAAM0WGBng",
		uid: "test",
		type: "page",
		tags: [],
		lang: "en-us",
		url: undefined,
		slug: "slug",
	})
})

it("returns equivalent link field from given document with `apiOptions.routes`", () => {
	const document = { ...documentFixture.empty }

	expect(documentToLinkField(document)).toStrictEqual({
		link_type: LinkType.Document,
		id: "XvoFFREAAM0WGBng",
		uid: "test",
		type: "page",
		tags: [],
		lang: "en-us",
		url: "/test",
		slug: "slug",
	})
})

it("returns equivalent link field from given document without uid", () => {
	const document = { ...documentFixture.empty, uid: null }

	expect(documentToLinkField(document)).toStrictEqual({
		link_type: LinkType.Document,
		id: "XvoFFREAAM0WGBng",
		uid: undefined,
		type: "page",
		tags: [],
		lang: "en-us",
		url: "/test",
		slug: "slug",
	})
})

it("returns equivalent link field from given document with non-empty data", () => {
	const document = { ...documentFixture.empty, data: { foo: "bar" } }

	expect(documentToLinkField(document)).toStrictEqual({
		link_type: LinkType.Document,
		id: "XvoFFREAAM0WGBng",
		uid: "test",
		type: "page",
		tags: [],
		lang: "en-us",
		url: "/test",
		slug: "slug",
		data: { foo: "bar" },
	})
})

// This test checks support for Gatsby users. The `slugs` field is not
// queriable in Gatsby since it is deprecated.
// Deprecation info: https://community.prismic.io/t/what-are-slugs/6493
it("supports documents without slugs field", () => {
	const document = {
		...documentFixture.empty,
		url: null,
		slugs: undefined,
	}

	expect(documentToLinkField(document)).toStrictEqual({
		link_type: LinkType.Document,
		id: "XvoFFREAAM0WGBng",
		uid: "test",
		type: "page",
		tags: [],
		lang: "en-us",
		url: undefined,
		slug: undefined,
	})
})
