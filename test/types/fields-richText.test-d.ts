import { assertType, it } from "vitest"

import type { RichTextField } from "../../src"
import type { RichTextNodeType } from "../../src"

it("supports filled values", () => {
	assertType<RichTextField>([
		{
			type: "paragraph",
			text: "string",
			spans: [
				{
					type: "strong",
					start: 0,
					end: 1,
				},
			],
		},
	])
	assertType<RichTextField<"filled">>([
		{
			type: "paragraph",
			text: "string",
			spans: [
				{
					type: "strong",
					start: 0,
					end: 1,
				},
			],
		},
	])
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<RichTextField<"filled">>([])
})

it("supports empty values", () => {
	assertType<RichTextField>([])
	assertType<RichTextField<"empty">>([])
	// @ts-expect-error - Empty fields cannot contain a filled value.
	assertType<RichTextField<"empty">>([
		{
			type: "paragraph",
			text: "string",
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

it("supports all root-level block types", () => {
	assertType<RichTextField>([
		{ type: "heading1", text: "string", spans: [] },
		{ type: "heading2", text: "string", spans: [] },
		{ type: "heading3", text: "string", spans: [] },
		{ type: "heading4", text: "string", spans: [] },
		{ type: "heading5", text: "string", spans: [] },
		{ type: "heading6", text: "string", spans: [] },
		{ type: "paragraph", text: "string", spans: [] },
		{ type: "preformatted", text: "string", spans: [] },
		{ type: "list-item", text: "string", spans: [] },
		{ type: "o-list-item", text: "string", spans: [] },
		{
			type: "image",
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
				link_type: "Web",
				url: "string",
				target: "string",
			},
		},
		{
			type: "embed",
			oembed: {
				embed_url: "https://example.com",
				type: "link",
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
	assertType<RichTextField>([
		{
			// @ts-expect-error - Not a root-level block type.
			type: "strong",
		},
	])
	assertType<RichTextField>([
		{
			// @ts-expect-error - Not a root-level block type.
			type: "em",
		},
	])
	assertType<RichTextField>([
		{
			// @ts-expect-error - Not a root-level block type.
			type: "label",
		},
	])
	assertType<RichTextField>([
		{
			// @ts-expect-error - Not a root-level block type.
			type: "hyperlink",
		},
	])
})

it("supports text blocks with spans", () => {
	assertType<RichTextField>([
		{
			type: "paragraph",
			text: "string",
			spans: [
				{
					type: "strong",
					start: 0,
					end: 0,
				},
				{
					type: "em",
					start: 0,
					end: 0,
				},
				{
					type: "label",
					start: 0,
					end: 0,
					data: {
						label: "string",
					},
				},
				{
					type: "hyperlink",
					start: 0,
					end: 0,
					data: {
						link_type: "Web",
						url: "string",
						target: "string",
					},
				},
			],
		},
	])
})

it("uses const object (not enum) to allow cross-version compatibility", () => {
	// Compatible literal values work (would fail if RichTextNodeType was an enum)
	assertType<typeof RichTextNodeType.paragraph>("paragraph")
	// @ts-expect-error - Incompatible values still fail.
	assertType<typeof RichTextNodeType.paragraph>("breaking")
})
