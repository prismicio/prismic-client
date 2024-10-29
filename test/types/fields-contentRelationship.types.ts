import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src"

;(value: prismic.ContentRelationshipField): true => {
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
 * Filled state (non-repeatable).
 */
expectType<prismic.ContentRelationshipField>({
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
expectType<prismic.ContentRelationshipField<string, string, never, "filled">>({
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
expectType<prismic.ContentRelationshipField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Document,
	// @ts-expect-error - Empty fields cannot contain a filled value.
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

/**
 * Filled state (repeatable).
 */
expectType<prismic.ContentRelationshipField>([
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
expectType<prismic.ContentRelationshipField<string, string, never, "filled">>([
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
expectType<prismic.ContentRelationshipField<string, string, never, "empty">>([
	// @ts-expect-error - Empty repeatable fields cannot contain a value.
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

/**
 * Empty state (non-repeatable).
 */
expectType<prismic.ContentRelationshipField>({
	link_type: prismic.LinkType.Document,
})
expectType<prismic.ContentRelationshipField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Document,
})
expectType<prismic.ContentRelationshipField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Document,
	},
)

/**
 * Empty state (repeatable).
 */
expectType<prismic.ContentRelationshipField>([
	{
		link_type: prismic.LinkType.Document,
	},
])
expectType<prismic.ContentRelationshipField<string, string, never, "empty">>([])
expectType<prismic.ContentRelationshipField<string, string, never, "empty">>([
	// @ts-expect-error - Empty fields cannot contain a value.
	{
		link_type: prismic.LinkType.Document,
	},
])

/**
 * Empty state with text (only non-repeatable).
 */
expectType<prismic.ContentRelationshipField>({
	link_type: prismic.LinkType.Document,
	text: "string",
})
expectType<prismic.ContentRelationshipField<string, string, never, "empty">>({
	link_type: prismic.LinkType.Document,
	text: "string",
})
expectType<prismic.ContentRelationshipField<string, string, never, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Document,
		text: "string",
	},
)

/**
 * Empty state with text (repeatable).
 */
expectType<prismic.ContentRelationshipField>([
	{
		link_type: prismic.LinkType.Document,
		text: "string",
	},
])
expectType<prismic.ContentRelationshipField<string, string, never, "filled">>([
	{
		link_type: prismic.LinkType.Document,
		text: "string",
	},
])

/**
 * Supports custom document type (non-repeatable).
 */
expectType<prismic.ContentRelationshipField<"foo">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "foo",
	tags: [],
	lang: "string",
})
expectType<prismic.ContentRelationshipField<"foo">>(
	// @ts-expect-error - Document type must match the given type.
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "string",
		tags: [],
		lang: "string",
	},
)

/**
 * Supports custom document type (repeatable).
 */
expectType<prismic.ContentRelationshipField<"foo">>([
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "foo",
		tags: [],
		lang: "string",
	},
])
expectType<prismic.ContentRelationshipField<"foo">>([
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		// @ts-expect-error - Document type must match the given type.
		type: "string",
		tags: [],
		lang: "string",
	},
])

/**
 * Supports custom document language (non-repeatable).
 */
expectType<prismic.ContentRelationshipField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "fr-fr",
})
// @ts-expect-error - Document language must match the given type.
expectType<prismic.ContentRelationshipField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "string",
})

/**
 * Supports custom document language (repeatable).
 */
expectType<prismic.ContentRelationshipField<string, "fr-fr">>([
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "string",
		tags: [],
		lang: "fr-fr",
	},
])
expectType<prismic.ContentRelationshipField<string, "fr-fr">>([
	{
		link_type: prismic.LinkType.Document,
		id: "string",
		type: "string",
		tags: [],
		// @ts-expect-error - Document language must match the given type.
		lang: "string",
	},
])

/**
 * Supports custom document data (non-repeatable).
 */
expectType<
	prismic.ContentRelationshipField<
		string,
		string,
		{ foo: prismic.BooleanField }
	>
>({
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
 * Supports custom document data (repeatable).
 */
expectType<
	prismic.ContentRelationshipField<
		string,
		string,
		{ foo: prismic.BooleanField }
	>
>([
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
