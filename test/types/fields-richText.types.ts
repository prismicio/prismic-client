import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src"

;(value: prismic.RichTextField): true => {
	if (!Array.isArray(value)) {
		return expectNever(value)
	}

	switch (typeof value[0]) {
		case "object": {
			if (value[0] === null) {
				expectNever(value[0])
			}

			return true
		}

		// When the field is empty, value[0] is undefined.
		case "undefined": {
			return true
		}

		default: {
			return expectNever(value[0])
		}
	}
}

/**
 * `RichTextNodeType` keeps compatibility with other versions.
 *
 * @see Related issue {@link https://github.com/prismicio/prismic-types/issues/16}
 */
const ForeignRichTextNodeType = {
	heading1: "heading1",
	breaking: "breaking",
} as const
expectType<typeof prismic.RichTextNodeType.heading1>(
	ForeignRichTextNodeType.heading1,
)
expectType<typeof prismic.RichTextNodeType.heading1>(
	// @ts-expect-error - `RichTextNodeType` should still fail with breaking changes
	ForeignRichTextNodeType.breaking,
)

/**
 * Filled state.
 */
expectType<prismic.RichTextField>([
	{
		type: prismic.RichTextNodeType.paragraph,
		text: "string",
		spans: [
			{
				type: prismic.RichTextNodeType.strong,
				start: 0,
				end: 1,
			},
		],
	},
])
expectType<prismic.RichTextField<"filled">>([
	{
		type: prismic.RichTextNodeType.paragraph,
		text: "string",
		spans: [
			{
				type: prismic.RichTextNodeType.strong,
				start: 0,
				end: 1,
			},
		],
	},
])
expectType<prismic.RichTextField<"empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	[
		{
			type: prismic.RichTextNodeType.paragraph,
			text: "string",
			spans: [
				{
					type: prismic.RichTextNodeType.strong,
					start: 0,
					end: 1,
				},
			],
		},
	],
)

/**
 * Empty state.
 */
expectType<prismic.RichTextField>([])
expectType<prismic.RichTextField<"empty">>([])
expectType<prismic.RichTextField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	[],
)

/**
 * Supports all root-level Structured Text block types.
 */
expectType<prismic.RichTextField>([
	{ type: prismic.RichTextNodeType.heading1, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.heading2, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.heading3, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.heading4, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.heading5, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.heading5, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.paragraph, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.preformatted, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.listItem, text: "string", spans: [] },
	{ type: prismic.RichTextNodeType.oListItem, text: "string", spans: [] },
	{
		type: prismic.RichTextNodeType.image,
		id: "string",
		alt: "string",
		url: "string",
		copyright: "string",
		dimensions: {
			width: 0,
			height: 0,
		},
		edit: { x: 0, y: 0, zoom: 0, background: "string" },
		linkTo: {
			link_type: prismic.LinkType.Web,
			url: "string",
			target: "string",
		},
	},
	{
		type: prismic.RichTextNodeType.embed,
		oembed: {
			embed_url: "https://example.com",
			type: prismic.OEmbedType.Link,
			version: "1.0",
			title: null,
			author_name: null,
			author_url: null,
			provider_name: null,
			provider_url: null,
			cache_age: null,
			thumbnail_url: null,
			thumbnail_width: null,
			thumbnail_height: null,
			html: null,
		},
	},
])
expectType<prismic.RichTextField>([
	{
		// @ts-expect-error - Not a root-level block type.
		type: prismic.RichTextNodeType.strong,
	},
])
expectType<prismic.RichTextField>([
	{
		// @ts-expect-error - Not a root-level block type.
		type: prismic.RichTextNodeType.em,
	},
])
expectType<prismic.RichTextField>([
	{
		// @ts-expect-error - Not a root-level block type.
		type: prismic.RichTextNodeType.label,
	},
])
expectType<prismic.RichTextField>([
	{
		// @ts-expect-error - Not a root-level block type.
		type: prismic.RichTextNodeType.hyperlink,
	},
])
expectType<prismic.RichTextField>([
	{
		// @ts-expect-error - Not a root-label block type (meta block for internal use only).
		type: prismic.RichTextNodeType.list,
	},
])
expectType<prismic.RichTextField>([
	{
		// @ts-expect-error - Not a root-label block type (meta block for internal use only).
		type: prismic.RichTextNodeType.oList,
	},
])

/**
 * Text blocks support spans.
 */
expectType<prismic.RichTextField>([
	{
		type: prismic.RichTextNodeType.paragraph,
		text: "string",
		spans: [
			{
				type: prismic.RichTextNodeType.strong,
				start: 0,
				end: 0,
			},
			{
				type: prismic.RichTextNodeType.em,
				start: 0,
				end: 0,
			},
			{
				type: prismic.RichTextNodeType.label,
				start: 0,
				end: 0,
				data: {
					label: "string",
				},
			},
			{
				type: prismic.RichTextNodeType.hyperlink,
				start: 0,
				end: 0,
				data: {
					link_type: prismic.LinkType.Web,
					url: "string",
					target: "string",
				},
			},
		],
	},
])
