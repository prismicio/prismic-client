import { it } from "./it"

import type { RichTextField } from "../src"
import { asHTML } from "../src"

const field: RichTextField = [
	{
		type: "paragraph",
		text: "foo bar baz",
		spans: [{ start: 4, end: 7, type: "strong" }],
	},
]

it("converts rich text to html", async ({ expect }) => {
	const res = asHTML(field)
	expect(res).toBe("<p>foo <strong>bar</strong> baz</p>")
})

it("supports serializer", async ({ expect }) => {
	const res = asHTML(field, {
		serializer: {
			paragraph: ({ children }) => `<p data-foo>${children}</p>`,
		},
	})
	expect(res).toBe("<p data-foo>foo <strong>bar</strong> baz</p>")
})

it("supports attribute serializer", async ({ expect }) => {
	const res = asHTML(field, {
		serializer: {
			paragraph: { "data-foo": true },
		},
	})
	expect(res).toBe("<p data-foo>foo <strong>bar</strong> baz</p>")
})

it("supports function serializer", async ({ expect }) => {
	const res = asHTML(field, {
		serializer: (type, _node, _text, children) => {
			if (type === "paragraph") {
				return `<p data-foo>${children}</p>`
			}
		},
	})
	expect(res).toBe("<p data-foo>foo <strong>bar</strong> baz</p>")
})

it("escapes external links to prevent XSS", async ({ expect }) => {
	const res = asHTML([
		{
			type: "paragraph",
			text: 'This is a link with XSS (")',
			spans: [
				{
					start: 10,
					end: 14,
					type: "hyperlink",
					data: {
						link_type: "Web",
						url: 'https://example.org" onmouseover="alert(document.cookie);',
					},
				},
			],
		},
	])
	expect(res).toBe(
		'<p>This is a <a href="https://example.org&quot; onmouseover=&quot;alert(document.cookie);" rel="noopener noreferrer">link</a> with XSS (&quot;)</p>',
	)
})

it("omits target attribute on links without target", async ({ expect }) => {
	const res = asHTML([
		{
			type: "paragraph",
			text: "link",
			spans: [
				{
					type: "hyperlink",
					start: 0,
					end: 4,
					data: {
						link_type: "Web",
						url: "https://example.org",
					},
				},
			],
		},
	])
	expect(res).toContain('href="https://example.org"')
	expect(res).not.toContain("target=")
})

it("includes target attribute on links with target", async ({ expect }) => {
	const res = asHTML([
		{
			type: "paragraph",
			text: "link",
			spans: [
				{
					type: "hyperlink",
					start: 0,
					end: 4,
					data: {
						link_type: "Web",
						url: "https://example.org",
						target: "_blank",
					},
				},
			],
		},
	])
	expect(res).toContain('target="_blank"')
})

it("includes dir attribute on right-to-left languages", async ({ expect }) => {
	const res = asHTML([
		{
			type: "paragraph",
			text: "foo bar baz",
			spans: [{ start: 4, end: 7, type: "strong" }],
			direction: "rtl",
		},
	])
	expect(res).toContain('<p dir="rtl"')
})

it("supports link resolver", async ({ expect }) => {
	const res = asHTML(
		[
			{
				type: "paragraph",
				text: "link",
				spans: [
					{
						type: "hyperlink",
						start: 0,
						end: 4,
						data: {
							link_type: "Document",
							id: "id",
							type: "page",
							tags: ["tag"],
							lang: "en-us",
							uid: "home",
							isBroken: false,
						},
					},
				],
			},
		],
		{ linkResolver: ({ uid }) => `/${uid}` },
	)
	expect(res).toContain('href="/home"')
})

it("returns empty string for empty field", async ({ expect }) => {
	expect(asHTML([])).toBe("")
})

it("returns null for null input", async ({ expect }) => {
	expect(asHTML(null)).toBeNull()
})

it("returns null for undefined input", async ({ expect }) => {
	expect(asHTML(undefined)).toBeNull()
})
