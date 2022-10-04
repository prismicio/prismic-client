import { it, expect } from "vitest";

import { documentFixture } from "./__fixtures__/document";
import { linkResolver } from "./__fixtures__/linkResolver";

import { asLink, LinkType } from "../src";

it("returns null for nullish inputs", () => {
	expect(asLink(null, linkResolver)).toBeNull();
	expect(asLink(undefined, linkResolver)).toBeNull();
});

it("returns null when link to document field is empty", () => {
	const field = {
		link_type: LinkType.Document,
	};

	expect(asLink(field, linkResolver)).toBeNull();
});

it("returns null when link to media field is empty", () => {
	const field = {
		link_type: LinkType.Media,
	};

	expect(asLink(field, linkResolver)).toBeNull();
});

it("returns null when link field is empty", () => {
	const field = {
		link_type: LinkType.Any,
	};

	expect(asLink(field, linkResolver)).toBeNull();
});

it("resolves a link to document field without Route Resolver", () => {
	const field = {
		id: "XvoFFREAAM0WGBng",
		type: "page",
		tags: [],
		slug: "slug",
		lang: "en-us",
		uid: "test",
		link_type: LinkType.Document,
		isBroken: false,
	};

	expect(
		asLink(field),
		"returns null if both Link Resolver and Route Resolver are not used",
	).toBeNull();
	expect(
		asLink(field, linkResolver),
		"uses Link Resolver URL if Link Resolver returns a non-nullish value",
	).toBe("/test");
	expect(
		asLink(field, () => undefined),
		"returns null if Link Resolver returns undefined",
	).toBeNull();
	expect(
		asLink(field, () => null),
		"returns null if Link Resolver returns null",
	).toBeNull();
});

it("resolves a link to document field with Route Resolver", () => {
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
	};

	expect(
		asLink(field),
		"uses Route Resolver URL if Link Resolver is not given",
	).toBe(field.url);
	expect(
		asLink(field, () => "link-resolver-value"),
		"uses Link Resolver URL if Link Resolver returns a non-nullish value",
	).toBe("link-resolver-value");
	expect(
		asLink(field, () => undefined),
		"uses Route Resolver URL if Link Resolver returns undefined",
	).toBe(field.url);
	expect(
		asLink(field, () => null),
		"uses Route Resolver URL if Link Resolver returns null",
	).toBe(field.url);
});

it("returns null when given a document field and linkResolver is not provided ", () => {
	const field = {
		id: "XvoFFREAAM0WGBng",
		link_type: LinkType.Document,
	};

	expect(asLink(field)).toBeNull();
});

it("resolves a link to web field", () => {
	const field = {
		link_type: LinkType.Web,
		url: "https://prismic.io",
	};

	expect(asLink(field, linkResolver), "https://prismic.io");
});

it("resolves a link to media field", () => {
	const field = {
		link_type: LinkType.Media,
		name: "test.jpg",
		kind: "image",
		url: "https://prismic.io",
		size: "420",
		height: "42",
		width: "42",
	};

	expect(asLink(field, linkResolver), "https://prismic.io");
});

it("resolves a document", () => {
	const document = { ...documentFixture.empty };

	expect(asLink(document), "/test");
});
