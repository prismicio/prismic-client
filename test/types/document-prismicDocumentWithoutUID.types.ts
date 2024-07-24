import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.PrismicDocumentWithoutUID): true => {
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

expectType<prismic.PrismicDocumentWithoutUID>({
	id: "string",
	uid: null,
	url: "string",
	type: "string",
	href: "string",
	tags: ["string"],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
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
 * Does not support string UID value.
 */
expectType<prismic.PrismicDocumentWithoutUID>({
	id: "string",
	// @ts-expect-error - Does not support string URL value.
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
})

/**
 * Supports nullable URL.
 */
expectType<prismic.PrismicDocumentWithoutUID>({
	id: "string",
	uid: null,
	url: null,
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
})

/**
 * Supports custom data interface.
 */
expectType<prismic.PrismicDocumentWithoutUID<{ foo: prismic.BooleanField }>>({
	id: "string",
	uid: null,
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
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
	prismic.PrismicDocumentWithoutUID<{
		group: prismic.GroupField
		sliceZone: prismic.SliceZone
	}>
>({
	id: "string",
	uid: null,
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
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
expectType<prismic.PrismicDocumentWithoutUID<Record<string, never>, "foo">>({
	id: "string",
	uid: null,
	url: "string",
	type: "foo",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
})
expectType<prismic.PrismicDocumentWithoutUID<Record<string, never>, "foo">>({
	id: "string",
	uid: null,
	url: "string",
	// @ts-expect-error - Document type must match the given type.
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
})

/**
 * Supports custom language.
 */
expectType<
	prismic.PrismicDocumentWithoutUID<Record<string, never>, string, "fr-fr">
>({
	id: "string",
	uid: null,
	url: "string",
	type: "foo",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
	slugs: [],
	linked_documents: [],
	lang: "fr-fr",
	alternate_languages: [],
	data: {},
})
expectType<
	prismic.PrismicDocumentWithoutUID<Record<string, never>, string, "fr-fr">
>({
	id: "string",
	uid: null,
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "2020-06-29T15:13:27+0000",
	last_publication_date: "2021-05-18T15:44:01+0000",
	slugs: [],
	linked_documents: [],
	// @ts-expect-error - Document lang must match the given language.
	lang: "string",
	alternate_languages: [],
	data: {},
})
