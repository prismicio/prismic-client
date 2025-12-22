import { assertType, it } from "vitest"

import type { TitleField } from "../../src"

it("supports filled values", () => {
	assertType<TitleField>([
		{
			type: "heading1",
			text: "string",
			spans: [],
		},
	])
	assertType<TitleField<"filled">>([
		{
			type: "heading1",
			text: "string",
			spans: [],
		},
	])
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<TitleField<"filled">>([])
})

it("supports empty values", () => {
	assertType<TitleField>([])
	assertType<TitleField<"empty">>([])
	// @ts-expect-error - Empty fields cannot contain a filled value.
	assertType<TitleField<"empty">>([
		{
			type: "heading1",
			text: "string",
			spans: [],
		},
	])
})

it("supports all heading block types", () => {
	assertType<TitleField>([{ type: "heading1", text: "string", spans: [] }])
	assertType<TitleField>([{ type: "heading2", text: "string", spans: [] }])
	assertType<TitleField>([{ type: "heading3", text: "string", spans: [] }])
	assertType<TitleField>([{ type: "heading4", text: "string", spans: [] }])
	assertType<TitleField>([{ type: "heading5", text: "string", spans: [] }])
	assertType<TitleField>([{ type: "heading6", text: "string", spans: [] }])
})

it("does not allow non-heading block types", () => {
	assertType<TitleField>([
		{
			// @ts-expect-error - Not a heading block type.
			type: "paragraph",
		},
	])
	assertType<TitleField>([
		{
			// @ts-expect-error - Not a heading block type.
			type: "preformatted",
		},
	])
	assertType<TitleField>([
		{
			// @ts-expect-error - Not a heading block type.
			type: "list-item",
		},
	])
	assertType<TitleField>([
		{
			// @ts-expect-error - Not a heading block type.
			type: "o-list-item",
		},
	])
	assertType<TitleField>([
		{
			// @ts-expect-error - Not a heading block type.
			type: "image",
		},
	])
	assertType<TitleField>([
		{
			// @ts-expect-error - Not a heading block type.
			type: "embed",
		},
	])
})

it("does not allow span elements", () => {
	assertType<TitleField>([
		{
			type: "heading1",
			text: "string",
			// @ts-expect-error - Does not allow span elements.
			spans: [
				{
					type: "strong",
					start: 0,
					end: 1,
				},
			],
		},
	])
})
