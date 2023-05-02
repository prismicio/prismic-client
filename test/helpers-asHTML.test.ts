import { expect, it } from "vitest";

import { htmlRichTextFunctionSerializer } from "./__fixtures__/htmlRichTextFunctionSerializer";
import { htmlRichTextMapSerializer } from "./__fixtures__/htmlRichTextMapSerializer";
import { linkResolver } from "./__fixtures__/linkResolver";
import { richTextFixture } from "./__fixtures__/richText";

import { RichTextField, asHTML } from "../src";

it("serializes with default serializer", () => {
	expect(asHTML(richTextFixture.en, { linkResolver })).toMatchSnapshot();

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(asHTML(richTextFixture.en, linkResolver)).toBe(
		asHTML(richTextFixture.en, { linkResolver }),
	);
});

it("serializes with a custom function serializer", () => {
	expect(
		asHTML(richTextFixture.en, {
			linkResolver,
			htmlRichTextSerializer: htmlRichTextFunctionSerializer,
		}),
	).toMatchSnapshot();

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(
		asHTML(richTextFixture.en, linkResolver, htmlRichTextFunctionSerializer),
	).toBe(
		asHTML(richTextFixture.en, {
			linkResolver,
			htmlRichTextSerializer: htmlRichTextFunctionSerializer,
		}),
	);
});

it("serializes with a custom map serializer", () => {
	expect(
		asHTML(richTextFixture.en, {
			linkResolver,
			htmlRichTextSerializer: htmlRichTextMapSerializer,
		}),
	).toMatchSnapshot();

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(
		asHTML(richTextFixture.en, linkResolver, htmlRichTextMapSerializer),
	).toBe(
		asHTML(richTextFixture.en, {
			linkResolver,
			htmlRichTextSerializer: htmlRichTextMapSerializer,
		}),
	);
});

it("escapes external links to prevent XSS", () => {
	expect(asHTML(richTextFixture.xss, { linkResolver })).toMatchSnapshot();
});

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
	];

	expect(asHTML(field, { linkResolver })).toMatchInlineSnapshot(
		'"<p><a href=\\"https://example.org\\" rel=\\"noopener noreferrer\\">link</a></p>"',
	);
});

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
	];

	expect(asHTML(field, { linkResolver })).toMatchInlineSnapshot(
		'"<p><a href=\\"https://example.org\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">link</a></p>"',
	);
});

it("returns null for nullish inputs", () => {
	expect(asHTML(null)).toBeNull();
	expect(asHTML(undefined)).toBeNull();
});
