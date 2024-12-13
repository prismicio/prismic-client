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
 * Filled state.
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
})

/**
 * Empty state.
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
 * Supports custom document type.
 */
expectType<prismic.ContentRelationshipField<"foo">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "foo",
	tags: [],
	lang: "string",
})
expectType<prismic.ContentRelationshipField<"foo">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	// @ts-expect-error - Document type must match the given type.
	type: "string",
	tags: [],
	lang: "string",
})

/**
 * Supports custom document language.
 */
expectType<prismic.ContentRelationshipField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	lang: "fr-fr",
})
expectType<prismic.ContentRelationshipField<string, "fr-fr">>({
	link_type: prismic.LinkType.Document,
	id: "string",
	type: "string",
	tags: [],
	// @ts-expect-error - Document language must match the given type.
	lang: "string",
})

/**
 * Supports custom document data.
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
