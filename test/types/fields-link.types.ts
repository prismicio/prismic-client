import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src"

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

// Web link (non-repeatable)
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Web,
	url: "string",
	target: "string",
	text: "string",
})

// Web link (repeatable)
expectType<prismic.LinkField>([
	{
		link_type: prismic.LinkType.Web,
		url: "string",
		target: "string",
		text: "string",
	},
])

// Content relationship link (non-repeatable)
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
})

// Content relationship link (repeatable)
expectType<prismic.LinkField>([
	{
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
	},
])

// Media link (non-repeatable)
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Media,
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
	text: "string",
})
expectType<prismic.LinkField<string, string, never, "filled">>({
	link_type: prismic.LinkType.Web,
	url: "string",
	target: "string",
	text: "string",
})
expectType<prismic.LinkField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Web,
	// @ts-expect-error - Empty fields cannot contain a filled value.
	url: "string",
	target: "string",
	text: "string",
})

// Media link (repeatable)
expectType<prismic.LinkField>([
	{
		link_type: prismic.LinkType.Media,
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
	},
])
expectType<prismic.LinkField<string, string, never, "filled">>([
	{
		link_type: prismic.LinkType.Web,
		url: "string",
		target: "string",
		text: "string",
	},
])
expectType<prismic.LinkField<string, string, never, "empty">>([])

/**
 * Empty state (non-repeatable).
 */
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Any,
})
expectType<prismic.LinkField<string, string, never, "filled">>({
	// @ts-expect-error - Filled fields cannot contain an empty value.
	link_type: prismic.LinkType.Any,
})
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Web,
})
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Web,
	},
)
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Document,
})
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Document,
	},
)
expectType<prismic.LinkField>({
	link_type: prismic.LinkType.Media,
})
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Media,
	},
)

/**
 * Empty state (repeatable).
 */
expectType<prismic.LinkField>([
	{
		link_type: prismic.LinkType.Any,
	},
])
expectType<prismic.LinkField<string, string, never, "empty">>([])
expectType<prismic.LinkField<string, string, never, "empty">>([
	// @ts-expect-error - Empty fields cannot contain a value.
	{
		link_type: prismic.LinkType.Web,
	},
])

/**
 * Empty state with text (non-repeatable).
 */
expectType<prismic.LinkField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Web,
	text: "string",
})
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Web,
		text: "string",
	},
)
expectType<prismic.LinkField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Document,
	text: "string",
})
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Document,
		text: "string",
	},
)
expectType<prismic.LinkField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Media,
	text: "string",
})
expectType<prismic.LinkField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Media,
		text: "string",
	},
)
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
 * Empty state with text (repeatable).
 */
expectType<prismic.LinkField<string, string, never, "filled">>([
	{
		link_type: prismic.LinkType.Web,
		text: "string",
	},
	{
		link_type: prismic.LinkType.Document,
		text: "string",
	},
	{
		link_type: prismic.LinkType.Media,
		text: "string",
	},
	{
		link_type: prismic.LinkType.Any,
		text: "string",
	},
])
expectType<prismic.LinkField<string, string, never, "empty">>([
	// @ts-expect-error - Empty fields cannot contain a value.
	{
		link_type: prismic.LinkType.Web,
		text: "string",
	},
])

/**
 * Supports custom document type for document links (non-repeatable).
 */
expectType<prismic.LinkField<"foo">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "foo",
	tags: [],
	lang: "string",
})
// @ts-expect-error - Document type must match the given type.
expectType<prismic.LinkField<"foo">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "string",
})

/**
 * Supports custom document type for document links (repeatable).
 */
expectType<prismic.LinkField<"foo">>([
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "foo",
		tags: [],
		lang: "string",
	},
])
expectType<prismic.LinkField<"foo">>([
	// @ts-expect-error - Document type must match the given type.
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "string",
		tags: [],
		lang: "string",
	},
])

/**
 * Supports custom document language for document links (non-repeatable).
 */
expectType<prismic.LinkField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "fr-fr",
})
// @ts-expect-error - Document language must match the given type.
expectType<prismic.LinkField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "string",
})

/**
 * Supports custom document language for document links (repeatable).
 */
expectType<prismic.LinkField<string, "fr-fr">>([
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "string",
		tags: [],
		lang: "fr-fr",
	},
])
expectType<prismic.LinkField<string, "fr-fr">>([
	// @ts-expect-error - Document language must match the given type.
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "string",
		tags: [],
		lang: "string",
	},
])

/**
 * Supports custom document data for document links (non-repeatable).
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

/**
 * Supports custom document data for document links (repeatable).
 */
expectType<prismic.LinkField<string, string, { foo: prismic.BooleanField }>>([
	{
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
	},
])

/**
 * Supports multiple link types (repeatable).
 */
expectType<prismic.LinkField>([
	{
		link_type: prismic.LinkType.Web,
		url: "string",
		target: "string",
		text: "string",
	},
	{
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
	},
	{
		link_type: prismic.LinkType.Media,
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
	},
	{
		link_type: prismic.LinkType.Web,
		text: "string",
	},
])
