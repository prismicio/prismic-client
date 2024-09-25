import type { TypeOf } from "ts-expect"
import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.PendingPrismicDocument): true => {
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

expectType<prismic.PendingPrismicDocument>({
	uid: "",
	type: "",
	lang: "",
	data: {},
})

/**
 * Supports any field when generic.
 */
expectType<prismic.PendingPrismicDocument>({
	uid: "",
	type: "",
	lang: "",
	data: {
		any: "",
	},
})

/**
 * `PrismicDocument` is assignable to `PendingPrismicDocument` with added
 * `title`.
 */
expectType<
	TypeOf<
		prismic.PendingPrismicDocument,
		prismic.PrismicDocument & { title: string }
	>
>(true)

// Migration Documents
type FooDocument = prismic.PrismicDocument<Record<string, never>, "foo">
type BarDocument = prismic.PrismicDocument<{ bar: prismic.KeyTextField }, "bar">
type BazDocument = prismic.PrismicDocument<Record<string, never>, "baz">
type Documents = FooDocument | BarDocument | BazDocument

type MigrationDocuments = prismic.PendingPrismicDocument<Documents>

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
	embedField: prismic.EmbedField
	migrationEmbedField: prismic.EmbedField
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
	prismic.PendingPrismicDocument<AdvancedDocuments>

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
		embedField: {} as prismic.EmbedField,
		migrationEmbedField: { embed_url: "https://example.com" },
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
				embedField: {} as prismic.EmbedField,
				migrationEmbedField: { embed_url: "https://example.com" },
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
				variation: "default",
				primary: {
					image: {} as prismic.ImageField,
					migrationImage: {} as prismic.MigrationImage,
					linkToMedia: {} as prismic.LinkToMediaField,
					migrationLinkToMedia: {} as prismic.MigrationLinkToMedia,
					contentRelationship: {} as prismic.ContentRelationshipField,
					migrationContentRelationship:
						{} as prismic.MigrationContentRelationship,
					embedField: {} as prismic.EmbedField,
					migrationEmbedField: { embed_url: "https://example.com" },
					group: [
						{
							image: {} as prismic.ImageField,
							migrationImage: {} as prismic.MigrationImage,
							linkToMedia: {} as prismic.LinkToMediaField,
							migrationLinkToMedia: {} as prismic.MigrationLinkToMedia,
							contentRelationship: {} as prismic.ContentRelationshipField,
							migrationContentRelationship:
								{} as prismic.MigrationContentRelationship,
							embedField: {} as prismic.EmbedField,
							migrationEmbedField: { embed_url: "https://example.com" },
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
						embedField: {} as prismic.EmbedField,
						migrationEmbedField: { embed_url: "https://example.com" },
					},
				],
			},
		],
	},
})
