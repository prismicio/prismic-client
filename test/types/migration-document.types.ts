import type { TypeOf } from "ts-expect"
import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.MigrationDocumentValue): true => {
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

expectType<prismic.MigrationDocumentValue>({
	uid: "",
	type: "",
	lang: "",
	data: {},
})

/**
 * Supports any field when generic.
 */
expectType<prismic.MigrationDocumentValue>({
	uid: "",
	type: "",
	lang: "",
	data: {
		any: "",
	},
})

/**
 * `PrismicDocument` is assignable to `MigrationDocumentValue` with added
 * `title`.
 */
expectType<
	TypeOf<
		prismic.MigrationDocumentValue,
		prismic.PrismicDocument & { title: string }
	>
>(true)

// Migration Documents
type FooDocument = prismic.PrismicDocument<Record<string, never>, "foo">
type BarDocument = prismic.PrismicDocument<{ bar: prismic.KeyTextField }, "bar">
type BazDocument = prismic.PrismicDocument<Record<string, never>, "baz">
type Documents = FooDocument | BarDocument | BazDocument

type MigrationDocuments = prismic.MigrationDocumentValue<Documents>

/**
 * Infers data type from document type.
 */
expectType<MigrationDocuments>({
	uid: "",
	type: "foo",
	lang: "",
	data: {},
})

// @ts-expect-error - `FooDocument` has no `bar` field in `data`
expectType<MigrationDocuments>({
	uid: "",
	type: "foo",
	lang: "",
	data: {
		bar: "",
	},
})

expectType<MigrationDocuments>({
	uid: "",
	type: "bar",
	lang: "",
	data: {
		bar: "",
	},
})

// @ts-expect-error - `bar` is missing in `data`
expectType<MigrationDocuments>({
	uid: "",
	type: "bar",
	lang: "",
	data: {},
})

/**
 * Accepts migration field types.
 */
type Fields = {
	image: prismic.ImageField
	migrationImage: prismic.ImageField
	linkToMedia: prismic.LinkToMediaField
	migrationLinkToMedia: prismic.LinkToMediaField
	contentRelationship: prismic.ContentRelationshipField
	migrationContentRelationship: prismic.ContentRelationshipField
}

type StaticDocument = prismic.PrismicDocument<Fields, "static">
type GroupDocument = prismic.PrismicDocument<
	{ group: prismic.GroupField<Fields> },
	"group"
>
type SliceDocument = prismic.PrismicDocument<
	{
		slices: prismic.SliceZone<
			prismic.SharedSlice<
				"default",
				prismic.SharedSliceVariation<
					"default",
					Fields & { group: prismic.GroupField<Fields> },
					Fields
				>
			>
		>
	},
	"slice"
>
type AdvancedDocuments = StaticDocument | GroupDocument | SliceDocument
type MigrationAdvancedDocuments =
	prismic.MigrationDocumentValue<AdvancedDocuments>

// Static
expectType<MigrationAdvancedDocuments>({
	uid: "",
	type: "static",
	lang: "",
	data: {
		image: {} as prismic.ImageField,
		migrationImage: {} as prismic.MigrationImage,
		linkToMedia: {} as prismic.LinkToMediaField,
		migrationLinkToMedia: {} as prismic.MigrationLinkToMedia,
		contentRelationship: {} as prismic.ContentRelationshipField,
		migrationContentRelationship: {} as prismic.MigrationContentRelationship,
	},
})

// Group
expectType<MigrationAdvancedDocuments>({
	uid: "",
	type: "group",
	lang: "",
	data: {
		group: [
			{
				image: {} as prismic.ImageField,
				migrationImage: {} as prismic.MigrationImage,
				linkToMedia: {} as prismic.LinkToMediaField,
				migrationLinkToMedia: {} as prismic.MigrationLinkToMedia,
				contentRelationship: {} as prismic.ContentRelationshipField,
				migrationContentRelationship:
					{} as prismic.MigrationContentRelationship,
			},
		],
	},
})

// Slice
expectType<MigrationAdvancedDocuments>({
	uid: "",
	type: "slice",
	lang: "",
	data: {
		slices: [
			{
				slice_type: "default",
				slice_label: null,
				id: "",
				variation: "default",
				version: "",
				primary: {
					image: {} as prismic.ImageField,
					migrationImage: {} as prismic.MigrationImage,
					linkToMedia: {} as prismic.LinkToMediaField,
					migrationLinkToMedia: {} as prismic.MigrationLinkToMedia,
					contentRelationship: {} as prismic.ContentRelationshipField,
					migrationContentRelationship:
						{} as prismic.MigrationContentRelationship,
					group: [
						{
							image: {} as prismic.ImageField,
							migrationImage: {} as prismic.MigrationImage,
							linkToMedia: {} as prismic.LinkToMediaField,
							migrationLinkToMedia: {} as prismic.MigrationLinkToMedia,
							contentRelationship: {} as prismic.ContentRelationshipField,
							migrationContentRelationship:
								{} as prismic.MigrationContentRelationship,
						},
					],
				},
				items: [
					{
						image: {} as prismic.ImageField,
						migrationImage: {} as prismic.MigrationImage,
						linkToMedia: {} as prismic.LinkToMediaField,
						migrationLinkToMedia: {} as prismic.MigrationLinkToMedia,
						contentRelationship: {} as prismic.ContentRelationshipField,
						migrationContentRelationship:
							{} as prismic.MigrationContentRelationship,
					},
				],
			},
		],
	},
})
