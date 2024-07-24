import { expect, it } from "vitest"

import { createRichTextFixtures } from "./__testutils__/createRichTextFixtures"

import { linkResolver } from "./__fixtures__/linkResolver"
import { partialHTMLRichTextFunctionSerializer } from "./__fixtures__/partialHTMLRichTextFunctionSerializer"
import { partialHTMLRichTextMapSerializer } from "./__fixtures__/partialHTMLRichTextMapSerializer"

import type { RichTextField } from "../src"
import { asHTML } from "../src"

it("serializes with default serializer", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(asHTML(richTextFixtures.en, { linkResolver })).toMatchSnapshot()

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(asHTML(richTextFixtures.en, linkResolver)).toBe(
		asHTML(richTextFixtures.en, { linkResolver }),
	)
})

it("serializes with a custom function serializer", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(
		asHTML(richTextFixtures.en, {
			linkResolver,
			serializer: partialHTMLRichTextFunctionSerializer,
		}),
	).toMatchSnapshot()

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(
		asHTML(
			richTextFixtures.en,
			linkResolver,
			partialHTMLRichTextFunctionSerializer,
		),
	).toBe(
		asHTML(richTextFixtures.en, {
			linkResolver,
			serializer: partialHTMLRichTextFunctionSerializer,
		}),
	)
})

it("serializes with a custom map serializer", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(
		asHTML(richTextFixtures.en, {
			linkResolver,
			serializer: partialHTMLRichTextMapSerializer,
		}),
	).toMatchSnapshot()

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(
		asHTML(richTextFixtures.en, linkResolver, partialHTMLRichTextMapSerializer),
	).toBe(
		asHTML(richTextFixtures.en, {
			linkResolver,
			serializer: partialHTMLRichTextMapSerializer,
		}),
	)
})

it("serializes with a custom shorthand map serializer", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(
		asHTML(richTextFixtures.en, {
			linkResolver,
			serializer: {
				heading1: { class: "text-xl", "data-heading": true },
				heading2: {
					xss: 'https://example.org" onmouseover="alert(document.cookie);',
				},
				label: { class: "shorthand" },
			},
		}),
	).toMatchSnapshot()
})

it("escapes external links to prevent XSS", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(asHTML(richTextFixtures.xss, { linkResolver })).toMatchSnapshot()
})

it("omits target attribute on links without a target value", () => {
	const field: RichTextField = [
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
	]

	expect(asHTML(field, { linkResolver })).toMatchInlineSnapshot(
		`"<p><a href="https://example.org" rel="noopener noreferrer">link</a></p>"`,
	)
})

it("includes target attribute on links with a target value", () => {
	const field: RichTextField = [
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
	]

	expect(asHTML(field, { linkResolver })).toMatchInlineSnapshot(
		`"<p><a href="https://example.org" target="_blank" rel="noopener noreferrer">link</a></p>"`,
	)
})

it("returns null for nullish inputs", () => {
	expect(asHTML(null)).toBeNull()
	expect(asHTML(undefined)).toBeNull()
})
