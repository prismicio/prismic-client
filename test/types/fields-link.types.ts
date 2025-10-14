import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src/index.ts"

;(value: prismic.LinkField): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				return expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

/**
 * `LinkType` keeps compatibility with other versions.
 *
 * @see Related issue {@link https://github.com/prismicio/prismic-types/issues/16}
 */
const ForeignLinkType = {
	Document: "Document",
	Breaking: "Breaking",
} as const
expectType<typeof prismic.LinkType.Document>(ForeignLinkType.Document)
expectType<typeof prismic.LinkType.Document>(
	// @ts-expect-error - `LinkType` should still fail with breaking changes
	ForeignLinkType.Breaking,
)

/**
 * Filled state.
 */
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Web,
	url: "string",
	target: "string",
	text: "string",
	variant: "string",
})
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Document,
	id: "string",
	uid: "string",
	type: "string",
	tags: ["string"],
	lang: "string",
	url: "string",
	slug: "string",
	isBroken: true,
	data: undefined,
	text: "string",
	variant: "string",
})
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Media,
	id: "string",
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
	text: "string",
	variant: "string",
})
expectType<prismic.LinkField<string, string, never, "filled">>({
	link_type: prismic.LinkType.Web,
	url: "string",
	target: "string",
	text: "string",
	variant: "string",
})
expectType<prismic.LinkField<string, string, never, "empty">>({
	// @ts-expect-error - Empty fields cannot contain a filled link type.
	link_type: prismic.LinkType.Web,
	url: "string",
	target: "string",
	text: "string",
	variant: "string",
})

/**
 * Empty state.
 */
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Any,
})
expectType<prismic.LinkField<string, string, never, "filled">>({
	// @ts-expect-error - Filled fields cannot contain an empty value.
	link_type: prismic.LinkType.Any,
})
expectType<prismic.LinkField>(
	// @ts-expect-error - Filled fields must contain properties.
	{
		link_type: prismic.LinkType.Web,
	},
)
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields must contain properties.
	{
		link_type: prismic.LinkType.Web,
	},
)
expectType<prismic.LinkField>(
	// @ts-expect-error - Filled fields must contain properties.
	{
		link_type: prismic.LinkType.Document,
	},
)
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields must contain properties.
	{
		link_type: prismic.LinkType.Document,
	},
)
expectType<prismic.LinkField>(
	// @ts-expect-error - Filled fields must contain properties.
	{
		link_type: prismic.LinkType.Media,
	},
)
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields must contain properties.
	{
		link_type: prismic.LinkType.Media,
	},
)

/**
 * Empty state with text.
 */
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Any,
	text: "string",
})
expectType<prismic.LinkField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Any,
	text: "string",
})
expectType<prismic.LinkField<string, string, never, "filled">>({
	// @ts-expect-error - Filled fields cannot contain an empty value.
	link_type: prismic.LinkType.Any,
	text: "string",
})

/**
 * Empty state with variant.
 */
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Any,
	variant: "string",
})
expectType<prismic.LinkField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Any,
	variant: "string",
})
expectType<prismic.LinkField<string, string, never, "empty", "foo" | "bar">>({
	link_type: prismic.LinkType.Any,
	variant: "foo",
})
expectType<prismic.LinkField<string, string, never, "empty", "foo" | "bar">>({
	link_type: prismic.LinkType.Any,
	// @ts-expect-error - Variant must match the given enum.
	variant: "string",
})

/**
 * Filled state with explicit variant.
 */
expectType<prismic.LinkField<string, string, never, "filled", "foo" | "bar">>({
	link_type: prismic.LinkType.Web,
	url: "string",
	target: "string",
	text: "string",
	variant: "foo",
})
expectType<prismic.LinkField<string, string, never, "filled", "foo" | "bar">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	uid: "string",
	type: "string",
	tags: ["string"],
	lang: "string",
	url: "string",
	slug: "string",
	isBroken: true,
	data: undefined,
	text: "string",
	variant: "foo",
})
expectType<prismic.LinkField<string, string, never, "filled", "foo" | "bar">>({
	link_type: prismic.LinkType.Media,
	id: "string",
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
	text: "string",
	variant: "foo",
})
expectType<prismic.LinkField<string, string, never, "filled", "foo" | "bar">>({
	link_type: prismic.LinkType.Web,
	url: "string",
	target: "string",
	text: "string",
	// @ts-expect-error - Variant must match the given enum.
	variant: "string",
})
expectType<prismic.LinkField<string, string, never, "filled", "foo" | "bar">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	uid: "string",
	type: "string",
	tags: ["string"],
	lang: "string",
	url: "string",
	slug: "string",
	isBroken: true,
	data: undefined,
	text: "string",
	// @ts-expect-error - Variant must match the given enum.
	variant: "string",
})
expectType<prismic.LinkField<string, string, never, "filled", "foo" | "bar">>({
	link_type: prismic.LinkType.Media,
	id: "string",
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
	text: "string",
	// @ts-expect-error - Variant must match the given enum.
	variant: "string",
})

/**
 * Supports custom document type for document links.
 */
expectType<prismic.LinkField<"foo">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "foo",
	tags: [],
	lang: "string",
})
expectType<prismic.LinkField<"foo">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	// @ts-expect-error - Document type must match the given type.
	type: "string",
	tags: [],
	lang: "string",
})

/**
 * Supports custom document language for document links.
 */
expectType<prismic.LinkField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "fr-fr",
})
expectType<prismic.LinkField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	// @ts-expect-error - Document language must match the given type.
	lang: "string",
})

/**
 * Supports custom document data for document links.
 */
expectType<prismic.LinkField<string, string, { foo: prismic.BooleanField }>>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "fr-fr",
	data: {
		foo: true,
		// @ts-expect-error - Only given fields are valid.
		bar: false,
	},
})
