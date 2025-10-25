import { it } from "./it"

import { LinkType, asLink } from "../src"

const docLink = {
	id: "XvoFFREAAM0WGBng",
	type: "page",
	tags: [],
	slug: "slug",
	lang: "en-us",
	uid: "foo",
	link_type: LinkType.Document,
	isBroken: false,
}
const docLinkWithURL = {
	...docLink,
	uid: "uid",
	url: "url",
}

it("resolves web link", async ({ expect }) => {
	const res = asLink({
		link_type: LinkType.Web,
		url: "https://prismic.io",
	})
	expect(res).toBe("https://prismic.io")
})

it("resolves media link", async ({ expect }) => {
	const res = asLink({
		link_type: LinkType.Media,
		id: "foo",
		name: "foo.jpg",
		kind: "image",
		url: "https://prismic.io/foo.jpg",
		size: "420",
		height: "42",
		width: "42",
	})
	expect(res).toBe("https://prismic.io/foo.jpg")
})

it("resolves document link with route resolver", async ({ expect }) => {
	const res = asLink(docLinkWithURL)
	expect(res).toBe(docLinkWithURL.url)
})

it("resolves document with route resolver", async ({ expect, docs }) => {
	const res = asLink(docs.default)
	expect(res).toBeDefined()
})

it("supports link resolver", async ({ expect }) => {
	const res = asLink(docLink, { linkResolver: ({ uid }) => `/${uid}` })
	expect(res).toBe("/foo")
})

it("prioritizes link resolver over route resolver", async ({ expect }) => {
	const res = asLink(docLinkWithURL, {
		linkResolver: () => "/link-resolver",
	})
	expect(res).toBe("/link-resolver")
})

it("falls back to route resolver when link resolver returns undefined", async ({
	expect,
}) => {
	const res = asLink(docLinkWithURL, { linkResolver: () => {} })
	expect(res).toBe(docLinkWithURL.url)
})

it("falls back to route resolver when link resolver returns null", async ({
	expect,
}) => {
	const res = asLink(docLinkWithURL, { linkResolver: () => null })
	expect(res).toBe(docLinkWithURL.url)
})

it("returns null for document link without resolver", async ({ expect }) => {
	const res = asLink(docLink)
	expect(res).toBeNull()
})

it("returns null for empty link field", async ({ expect }) => {
	const res = asLink({ link_type: LinkType.Any })
	expect(res).toBeNull()
})

it("returns null for null input", async ({ expect }) => {
	const res = asLink(null)
	expect(res).toBeNull()
})

it("returns null for undefined input", async ({ expect }) => {
	const res = asLink(undefined)
	expect(res).toBeNull()
})
