import { expect, it } from "vitest"

import { documentFixture } from "./__fixtures__/document"
import { linkResolver } from "./__fixtures__/linkResolver"

import { LinkType, asLink } from "../src"

it("returns null for nullish inputs", () => {
	expect(asLink(null, linkResolver)).toBeNull()
	expect(asLink(undefined, linkResolver)).toBeNull()
})

it("returns null when link to document field is empty", () => {
	const field = {
		link_type: LinkType.Document,
	}

	expect(asLink(field, linkResolver)).toBeNull()
})

it("returns null when link to media field is empty", () => {
	const field = {
		link_type: LinkType.Media,
	}

	expect(asLink(field, linkResolver)).toBeNull()
})

it("returns null when link field is empty", () => {
	const field = {
		link_type: LinkType.Any,
	}

	expect(asLink(field, linkResolver)).toBeNull()
})

it("resolves a link to document field without route resolver", () => {
	const field = {
		id: "XvoFFREAAM0WGBng",
		type: "page",
		tags: [],
		slug: "slug",
		lang: "en-us",
		uid: "test",
		link_type: LinkType.Document,
		isBroken: false,
	}

	expect(
		asLink(field),
		"returns null if both link resolver and route resolver are not used",
	).toBeNull()
	expect(
		asLink(field, { linkResolver }),
		"uses link resolver URL if link resolver returns a non-nullish value",
	).toBe("/test")
	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(
		asLink(field, linkResolver),
		"uses link resolver URL if link resolver returns a non-nullish value (deprecated tuple configuration)",
	).toBe("/test")
	expect(
		asLink(field, { linkResolver: () => undefined }),
		"returns null if link resolver returns undefined",
	).toBeNull()
	expect(
		asLink(field, { linkResolver: () => null }),
		"returns null if link resolver returns null",
	).toBeNull()
})

it("resolves a link to document field with route resolver", () => {
	const field = {
		id: "XvoFFREAAM0WGBng",
		type: "page",
		tags: [],
		slug: "slug",
		lang: "en-us",
		uid: "uid",
		url: "url",
		link_type: LinkType.Document,
		isBroken: false,
	}

	expect(
		asLink(field),
		"uses route resolver URL if link resolver is not given",
	).toBe(field.url)
	expect(
		asLink(field, { linkResolver: () => "link-resolver-value" }),
		"uses link resolver URL if link resolver returns a non-nullish value",
	).toBe("link-resolver-value")
	expect(
		asLink(field, { linkResolver: () => undefined }),
		"uses route resolver URL if link resolver returns undefined",
	).toBe(field.url)
	expect(
		asLink(field, { linkResolver: () => null }),
		"uses route resolver URL if link resolver returns null",
	).toBe(field.url)
})

it("returns null when given a document field and linkResolver is not provided ", () => {
	const field = {
		id: "XvoFFREAAM0WGBng",
		link_type: LinkType.Document,
	}

	expect(asLink(field)).toBeNull()
})

it("resolves a link to web field", () => {
	const field = {
		link_type: LinkType.Web,
		url: "https://prismic.io",
	}

	expect(asLink(field, { linkResolver })).toBe("https://prismic.io")
})

it("resolves a link to media field", () => {
	const field = {
		link_type: LinkType.Media,
		name: "test.jpg",
		kind: "image",
		url: "https://prismic.io",
		size: "420",
		height: "42",
		width: "42",
	}

	expect(asLink(field, { linkResolver })).toBe("https://prismic.io")
})

it("resolves a document", () => {
	const document = { ...documentFixture.empty }

	expect(asLink(document)).toBe("/test")
})
