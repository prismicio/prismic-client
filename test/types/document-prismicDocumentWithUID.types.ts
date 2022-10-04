import { expectType, expectNever } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.PrismicDocumentWithUID): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value);
			}

			return true;
		}

		default: {
			return expectNever(value);
		}
	}
};

expectType<prismic.PrismicDocumentWithUID>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: ["string"],
	first_publication_date: "string",
	last_publication_date: "string",
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
});

/**
 * Does not support null UID value.
 */
expectType<prismic.PrismicDocumentWithUID>({
	id: "string",
	// @ts-expect-error - Does not support string URL value.
	uid: null,
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
});

/**
 * Supports nullable URL.
 */
expectType<prismic.PrismicDocumentWithUID>({
	id: "string",
	uid: "string",
	url: null,
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
});

/**
 * Supports custom data interface.
 */
expectType<prismic.PrismicDocumentWithUID<{ foo: prismic.BooleanField }>>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {
		foo: true,
		// @ts-expect-error - Only given fields are valid.
		bar: false,
	},
});

/**
 * Custom data interface supports Group and Slice Zone fields.
 */
expectType<
	prismic.PrismicDocumentWithUID<{
		group: prismic.GroupField;
		sliceZone: prismic.SliceZone;
	}>
>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {
		group: [],
		sliceZone: [],
	},
});

/**
 * Supports custom type.
 */
expectType<prismic.PrismicDocumentWithUID<Record<string, never>, "foo">>({
	id: "string",
	uid: "string",
	url: "string",
	type: "foo",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
});
expectType<prismic.PrismicDocumentWithUID<Record<string, never>, "foo">>({
	id: "string",
	uid: "string",
	url: "string",
	// @ts-expect-error - Document type must match the given type.
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	lang: "string",
	alternate_languages: [],
	data: {},
});

/**
 * Supports custom language.
 */
expectType<
	prismic.PrismicDocumentWithUID<Record<string, never>, string, "fr-fr">
>({
	id: "string",
	uid: "string",
	url: "string",
	type: "foo",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	lang: "fr-fr",
	alternate_languages: [],
	data: {},
});
expectType<
	prismic.PrismicDocumentWithUID<Record<string, never>, string, "fr-fr">
>({
	id: "string",
	uid: "string",
	url: "string",
	type: "string",
	href: "string",
	tags: [],
	first_publication_date: "string",
	last_publication_date: "string",
	slugs: [],
	linked_documents: [],
	// @ts-expect-error - Document lang must match the given language.
	lang: "string",
	alternate_languages: [],
	data: {},
});
