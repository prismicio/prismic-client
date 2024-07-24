import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.PrismicDocument): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

expectType<prismic.PrismicDocument>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: ["string"],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: ["string"],
	linked_documents: [],
	lang: "string",
	alternate_languages: [
		{
			id: "string",
			lang: "string",
			type: "string",
			uid: "string",
		},
	],
	data: {},
})

/**
 * Supports nullable UID and URL.
 */
expectType<prismic.PrismicDocument>({
	id: "string",
	uid: null,
	url: null,
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
})

/**
 * Supports custom data interface.
 */
expectType<prismic.PrismicDocument<{ foo: prismic.BooleanField }>>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {
		foo: true,
		// @ts-expect-error - Only given fields are valid.
		bar: false,
	},
})

/**
 * Custom data interface supports Group and Slice Zone fields.
 */
expectType<
	prismic.PrismicDocument<{
		group: prismic.GroupField
		sliceZone: prismic.SliceZone
	}>
>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {
		group: [],
		sliceZone: [],
	},
})

/**
 * Supports custom type.
 */
expectType<prismic.PrismicDocument<Record<string, never>, "foo">>({
	id: "string",
	uid: "string",
	url: "string",
	type: "foo",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
})
expectType<prismic.PrismicDocument<Record<string, never>, "foo">>({
	id: "string",
	uid: "string",
	url: "string",
	// @ts-expect-error - Document type must match the given type.
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
})

/**
 * Supports custom language.
 */
expectType<prismic.PrismicDocument<Record<string, never>, string, "fr-fr">>({
	id: "string",
	uid: "string",
	url: "string",
	type: "foo",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: [],
	linked_documents: [],
	lang: "fr-fr",
	alternate_languages: [],
	data: {},
})
expectType<prismic.PrismicDocument<Record<string, string>, string, "fr-fr">>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2020-06-29T15:13:27+0000",
	slugs: [],
	linked_documents: [],
	// @ts-expect-error - Document lang must match the given language.
	lang: "string",
	alternate_languages: [],
	data: {},
})
