import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src"

;(value: prismic.TitleField): true => {
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
 * Filled state.
 */
expectType<prismic.TitleField>([
	{
		type: prismic.RichTextNodeType.heading1,
		text: "string",
		spans: [],
	},
])
expectType<prismic.TitleField<"filled">>([
	{
		type: prismic.RichTextNodeType.heading1,
		text: "string",
		spans: [],
	},
])
expectType<prismic.TitleField<"empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	[
		{
			type: prismic.RichTextNodeType.heading1,
			text: "string",
			spans: [],
		},
	],
)

/**
 * Empty state.
 */
expectType<prismic.TitleField>([])
expectType<prismic.TitleField<"empty">>([])
expectType<prismic.TitleField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	[],
)

/**
 * Supports all heading Structured Text block types.
 */
expectType<prismic.TitleField>([
	{ type: prismic.RichTextNodeType.heading1, text: "string", spans: [] },
])
expectType<prismic.TitleField>([
	{ type: prismic.RichTextNodeType.heading2, text: "string", spans: [] },
])
expectType<prismic.TitleField>([
	{ type: prismic.RichTextNodeType.heading3, text: "string", spans: [] },
])
expectType<prismic.TitleField>([
	{ type: prismic.RichTextNodeType.heading4, text: "string", spans: [] },
])
expectType<prismic.TitleField>([
	{ type: prismic.RichTextNodeType.heading5, text: "string", spans: [] },
])
expectType<prismic.TitleField>([
	{ type: prismic.RichTextNodeType.heading5, text: "string", spans: [] },
])

/**
 * Does not allow non-heading Structured Text block types.
 */
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.paragraph,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.preformatted,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.listItem,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.oListItem,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.image,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.embed,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.strong,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.em,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.label,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error Not a heading block type.
		type: prismic.RichTextNodeType.hyperlink,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error - Not a root-label block type (meta block for internal use only).
		type: prismic.RichTextNodeType.list,
	},
])
expectType<prismic.TitleField>([
	{
		// @ts-expect-error - Not a root-label block type (meta block for internal use only).
		type: prismic.RichTextNodeType.oList,
	},
])

/**
 * Does not allow spans elements.
 */
expectType<prismic.TitleField>([
	{
		type: prismic.RichTextNodeType.heading1,
		text: "string",
		// @ts-expect-error - Does not allow span elements.
		spans: [
			{
				type: prismic.RichTextNodeType.strong,
				start: 0,
				end: 1,
			},
		],
	},
])
