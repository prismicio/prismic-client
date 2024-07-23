import { expect, it, vi } from "vitest"

import { asLinkAttrs } from "../src"

it("returns empty object for nullish inputs", () => {
	expect(asLinkAttrs(null)).toEqual({})
	expect(asLinkAttrs(undefined)).toEqual({})
})

it("returns empty object when link field is empty", (ctx) => {
	const field = ctx.mock.value.link({ type: "Any", state: "empty" })

	expect(asLinkAttrs(field)).toEqual({})
})

it("returns empty object when link to document field is empty", (ctx) => {
	const field = ctx.mock.value.link({ type: "Document", state: "empty" })

	expect(asLinkAttrs(field)).toEqual({})
})

it("returns empty object when link to media field is empty", (ctx) => {
	const field = ctx.mock.value.link({ type: "Media", state: "empty" })

	expect(asLinkAttrs(field)).toEqual({})
})

it("returns empty object when link to web field is empty", (ctx) => {
	const field = ctx.mock.value.link({ type: "Web", state: "empty" })

	expect(asLinkAttrs(field)).toEqual({})
})

it("resolves a link to document field with route resolver", (ctx) => {
	const field = ctx.mock.value.link({ type: "Document" })
	field.url = "/url"

	expect(asLinkAttrs(field)).toEqual({
		href: field.url,
		target: undefined,
		rel: undefined,
	})
	expect(asLinkAttrs(field, { linkResolver: () => "/linkResolver" })).toEqual({
		href: "/linkResolver",
		target: undefined,
		rel: undefined,
	})
})

it("resolves a link to document field without route resolver", (ctx) => {
	const field = ctx.mock.value.link({ type: "Document" })
	field.url = undefined

	expect(asLinkAttrs(field)).toEqual({
		href: undefined,
		target: undefined,
		rel: undefined,
	})
	expect(asLinkAttrs(field, { linkResolver: () => "/linkResolver" })).toEqual({
		href: "/linkResolver",
		target: undefined,
		rel: undefined,
	})
})

it("resolves a link to web field", (ctx) => {
	const field = ctx.mock.value.link({ type: "Web" })

	expect(asLinkAttrs(field)).toEqual({
		href: field.url,
		target: undefined,
		rel: "noreferrer",
	})
	expect(asLinkAttrs(field, { linkResolver: () => "/linkResolver" })).toEqual({
		href: field.url,
		target: undefined,
		rel: "noreferrer",
	})
})

it("returns correct target when field has a target", (ctx) => {
	const field = ctx.mock.value.link({ type: "Web", withTargetBlank: true })

	expect(asLinkAttrs(field)).toEqual({
		href: field.url,
		target: field.target,
		rel: "noreferrer",
	})
	expect(asLinkAttrs(field, { linkResolver: () => "/linkResolver" })).toEqual({
		href: field.url,
		target: field.target,
		rel: "noreferrer",
	})
})

it("resolves a link to media field", (ctx) => {
	const field = ctx.mock.value.link({ type: "Media" })

	expect(asLinkAttrs(field)).toEqual({
		href: field.url,
		target: undefined,
		rel: "noreferrer",
	})
	expect(asLinkAttrs(field, { linkResolver: () => "/linkResolver" })).toEqual({
		href: field.url,
		target: undefined,
		rel: "noreferrer",
	})
})

it("resolves a document", (ctx) => {
	const doc = ctx.mock.value.document()
	doc.url = "/foo"

	expect(asLinkAttrs(doc)).toEqual({
		href: doc.url,
		target: undefined,
		rel: undefined,
	})
	expect(asLinkAttrs(doc, { linkResolver: () => "/linkResolver" })).toEqual({
		href: "/linkResolver",
		target: undefined,
		rel: undefined,
	})
})

it('returns "noreferrer" `rel` value when the field\'s `href` is external', (ctx) => {
	const field = ctx.mock.value.link({ type: "Web" })

	expect(asLinkAttrs(field).rel).toBe("noreferrer")
	expect(asLinkAttrs(field, { linkResolver: () => "/linkResolver" }).rel).toBe(
		"noreferrer",
	)
})

it("allows the `rel` value to be configured using `config.rel`", (ctx) => {
	const internalField = ctx.mock.value.link({ type: "Document" })
	internalField.url = "/foo"

	const externalField = ctx.mock.value.link({ type: "Web" })
	externalField.url = "https://prismic.io"
	externalField.target = "_blank"

	const relFn = vi.fn().mockImplementation(() => "bar")

	const internalRes = asLinkAttrs(internalField, { rel: relFn })
	expect(internalRes.rel).toBe("bar")
	expect(relFn).toHaveBeenNthCalledWith(1, {
		href: internalField.url,
		target: undefined,
		isExternal: false,
	})

	const externalRes = asLinkAttrs(externalField, { rel: relFn })
	expect(externalRes.rel).toBe("bar")
	expect(relFn).toHaveBeenNthCalledWith(2, {
		href: externalField.url,
		target: externalField.target,
		isExternal: true,
	})
})
