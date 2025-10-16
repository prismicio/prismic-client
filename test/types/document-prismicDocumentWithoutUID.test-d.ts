import { assertType, it } from "vitest"

import type {
	BooleanField,
	GroupField,
	PrismicDocumentWithoutUID,
	SliceZone,
} from "../../src"

it("supports basic document without UID structure", () => {
	assertType<PrismicDocumentWithoutUID>({
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
})

it("does not support string UID value", () => {
	assertType<PrismicDocumentWithoutUID>({
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
})

it("supports nullable URL", () => {
	assertType<PrismicDocumentWithoutUID>({
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
})

it("supports custom data interface", () => {
	assertType<PrismicDocumentWithoutUID<{ foo: BooleanField }>>({
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
})

it("supports Group and Slice Zone fields in custom data", () => {
	assertType<
		PrismicDocumentWithoutUID<{
			group: GroupField
			sliceZone: SliceZone
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
})

it("supports custom type", () => {
	assertType<PrismicDocumentWithoutUID<Record<string, never>, "foo">>({
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
	assertType<PrismicDocumentWithoutUID<Record<string, never>, "foo">>({
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
})

it("supports custom language", () => {
	assertType<
		PrismicDocumentWithoutUID<Record<string, never>, string, "fr-fr">
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
	assertType<
		PrismicDocumentWithoutUID<Record<string, never>, string, "fr-fr">
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
})
