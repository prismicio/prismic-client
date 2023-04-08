import { expect, it } from "vitest";

import { documentFixture } from "./__fixtures__/document";
import { linkResolver } from "./__fixtures__/linkResolver";

import { LinkType, asLinkAttrs } from "../src";

it("returns empty object for nullish inputs", () => {
	expect(asLinkAttrs(null, linkResolver)).toEqual({});
	expect(asLinkAttrs(undefined, linkResolver)).toEqual({});
});

it("returns empty object when link to document field is empty", () => {
	const field = {
		link_type: LinkType.Document,
	};

	expect(asLinkAttrs(field, linkResolver)).toEqual({});
});

it("returns empty object when link to media field is empty", () => {
	const field = {
		link_type: LinkType.Media,
	};

	expect(asLinkAttrs(field, linkResolver)).toEqual({});
});

it("returns empty object when link field is empty", () => {
	const field = {
		link_type: LinkType.Any,
	};

	expect(asLinkAttrs(field, linkResolver)).toEqual({});
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
		asLinkAttrs(field),
		"returns empty object if both Link Resolver and Route Resolver are not used",
	).toEqual({});
	expect(
		asLinkAttrs(field, linkResolver),
		"uses Link Resolver URL if Link Resolver returns a non-nullish value",
	).toEqual({
		href: "/test",
		target: undefined,
		rel: undefined,
	});
	expect(
		asLinkAttrs(field, () => undefined),
		"returns empty object if Link Resolver returns undefined",
	).toEqual({});
	expect(
		asLinkAttrs(field, () => null),
		"returns empty object if Link Resolver returns null",
	).toEqual({});
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
		asLinkAttrs(field),
		"uses Route Resolver URL if Link Resolver is not given",
	).toEqual({
		href: field.url,
		target: undefined,
		rel: undefined,
	});
	expect(
		asLinkAttrs(field, () => "link-resolver-value"),
		"uses Link Resolver URL if Link Resolver returns a non-nullish value",
	).toEqual({
		href: "link-resolver-value",
		target: undefined,
		rel: undefined,
	});
	expect(
		asLinkAttrs(field, () => undefined),
		"uses Route Resolver URL if Link Resolver returns undefined",
	).toEqual({
		href: field.url,
		target: undefined,
		rel: undefined,
	});
	expect(
		asLinkAttrs(field, () => null),
		"uses Route Resolver URL if Link Resolver returns null",
	).toEqual({
		href: field.url,
		target: undefined,
		rel: undefined,
	});
});

it("returns empty object when given a document field and linkResolver is not provided ", () => {
	const field = {
		id: "XvoFFREAAM0WGBng",
		link_type: LinkType.Document,
	};

	expect(asLinkAttrs(field)).toEqual({});
});

it("resolves a link to web field", () => {
	const field = {
		link_type: LinkType.Web,
		url: "https://prismic.io",
	};

	expect(asLinkAttrs(field, linkResolver)).toEqual({
		href: "https://prismic.io",
		target: undefined,
		rel: undefined,
	});
});

it("returns correct target when field has a target", () => {
	const field = {
		link_type: LinkType.Web,
		url: "https://prismic.io",
		target: "_blank",
	};

	expect(asLinkAttrs(field, linkResolver).target).toBe(field.target);
});

it('returns "noopener noreferrer" rel value when the field\'s target is "_blank"', () => {
	const field = {
		link_type: LinkType.Web,
		url: "https://prismic.io",
		target: "_blank",
	};

	expect(asLinkAttrs(field, linkResolver).rel).toBe("noopener noreferrer");
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

	expect(asLinkAttrs(field, linkResolver)).toEqual({
		href: "https://prismic.io",
		target: undefined,
		rel: undefined,
	});
});

it("resolves a document", () => {
	const document = { ...documentFixture.empty };

	expect(asLinkAttrs(document)).toEqual({
		href: "/test",
		target: undefined,
		rel: undefined,
	});
});
