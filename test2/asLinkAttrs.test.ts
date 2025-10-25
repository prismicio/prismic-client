import { vi } from "vitest"

import { it } from "./it"

import { LinkType, asLinkAttrs } from "../src"

const docLink = {
	id: "XvoFFREAAM0WGBng",
	type: "page",
	tags: [],
	lang: "en-us",
	link_type: LinkType.Document,
	isBroken: false,
}
const docLinkWithURL = {
	...docLink,
	url: "/url",
}

it("resolves web link", async ({ expect }) => {
	const res = asLinkAttrs({
		link_type: LinkType.Web,
		url: "https://example.org",
	})
	expect(res).toEqual({
		href: "https://example.org",
		target: undefined,
		rel: "noreferrer",
	})
})

it("includes target on web link with target", async ({ expect }) => {
	const res = asLinkAttrs({
		link_type: LinkType.Web,
		url: "https://example.org",
		target: "_blank",
	})
	expect(res).toEqual({
		href: "https://example.org",
		target: "_blank",
		rel: "noreferrer",
	})
})

it("resolves media link", async ({ expect }) => {
	const res = asLinkAttrs({
		link_type: LinkType.Media,
		id: "foo",
		name: "foo.jpg",
		kind: "image",
		url: "https://prismic.io/foo.jpg",
		size: "420",
		height: "42",
		width: "42",
	})
	expect(res).toEqual({
		href: "https://prismic.io/foo.jpg",
		target: undefined,
		rel: "noreferrer",
	})
})

it("resolves document link with route resolver", async ({ expect }) => {
	const res = asLinkAttrs(docLinkWithURL)
	expect(res).toEqual({
		href: docLinkWithURL.url,
		target: undefined,
		rel: undefined,
	})
})

it("resolves document", async ({ expect, docs }) => {
	const res = asLinkAttrs({ ...docs.default, url: "/url" })
	expect(res).toEqual({
		href: "/url",
		target: undefined,
		rel: undefined,
	})
})

it("resolves document link with link resolver", async ({ expect }) => {
	const res = asLinkAttrs(docLinkWithURL, { linkResolver: () => "/resolver" })
	expect(res).toEqual({
		href: "/resolver",
		target: undefined,
		rel: undefined,
	})
})

it("customizes rel value with config", async ({ expect }) => {
	const relFn = vi.fn().mockReturnValue("custom")
	const res = asLinkAttrs(
		{
			link_type: LinkType.Web,
			url: "https://example.org",
		},
		{ rel: relFn },
	)
	expect(res.rel).toBe("custom")
	expect(relFn).toHaveBeenCalledWith({
		href: "https://example.org",
		target: undefined,
		isExternal: true,
	})
})

it("returns undefined href for document link without resolver", async ({
	expect,
}) => {
	const res = asLinkAttrs(docLink)
	expect(res).toEqual({
		href: undefined,
		target: undefined,
		rel: undefined,
	})
})

it("returns empty object for null input", async ({ expect }) => {
	const res = asLinkAttrs(null)
	expect(res).toEqual({})
})

it("returns empty object for undefined input", async ({ expect }) => {
	const res = asLinkAttrs(undefined)
	expect(res).toEqual({})
})

it("returns empty object for empty link field", async ({ expect }) => {
	const res = asLinkAttrs({ link_type: LinkType.Any })
	expect(res).toEqual({})
})
