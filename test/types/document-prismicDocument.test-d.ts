import { assertType, it } from "vitest"

import type {
	BooleanField,
	GroupField,
	PrismicDocument,
	SliceZone,
} from "../../src"

it("supports basic document structure", () => {
	assertType<PrismicDocument>({
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
})

it("supports nullable UID and URL", () => {
	assertType<PrismicDocument>({
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
})

it("supports custom data interface", () => {
	assertType<PrismicDocument<{ foo: BooleanField }>>({
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
})

it("supports Group and Slice Zone fields in custom data", () => {
	assertType<
		PrismicDocument<{
			group: GroupField
			sliceZone: SliceZone
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
})

it("supports custom type", () => {
	assertType<PrismicDocument<Record<string, never>, "foo">>({
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
	assertType<PrismicDocument<Record<string, never>, "foo">>({
		// @ts-expect-error - Document type must match the given type.
		type: "string",
	})
})

it("supports custom language", () => {
	assertType<PrismicDocument<Record<string, never>, string, "fr-fr">>({
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
	assertType<PrismicDocument<Record<string, string>, string, "fr-fr">>({
		// @ts-expect-error - Document lang must match the given language.
		lang: "string",
	})
})
