import type { TypeOf } from "ts-expect"
import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.MigrationPrismicDocument): true => {
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

expectType<prismic.MigrationPrismicDocument>({
	uid: "",
	type: "",
	lang: "",
	data: {},
})

/**
 * Supports any field when generic.
 */
expectType<prismic.MigrationPrismicDocument>({
	uid: "",
	type: "",
	lang: "",
	data: {
		any: "",
	},
})

/**
 * `PrismicDocument` is assignable to `MigrationPrismicDocument` with added
 * `title`.
 */
expectType<
	TypeOf<
		prismic.MigrationPrismicDocument,
		prismic.PrismicDocument & { title: string }
	>
>(true)

// Migration Documents
type FooDocument = prismic.PrismicDocument<Record<string, never>, "foo">
type BarDocument = prismic.PrismicDocument<{ bar: prismic.KeyTextField }, "bar">
type BazDocument = prismic.PrismicDocument<Record<string, never>, "baz">
type Documents = FooDocument | BarDocument | BazDocument

type MigrationDocuments = prismic.MigrationPrismicDocument<Documents>

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
	link: prismic.LinkField
	migrationLink: prismic.LinkField
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
	prismic.MigrationPrismicDocument<AdvancedDocuments>

// Static
expectType<MigrationAdvancedDocuments>({
	uid: "",
	type: "static",
	lang: "",
	data: {
		image: {} as prismic.ImageField,
		migrationImage: {} as prismic.MigrationImageField,
		link: {} as prismic.LinkField,
		migrationLink: {} as prismic.MigrationLinkField,
		linkToMedia: {} as prismic.LinkToMediaField,
		migrationLinkToMedia: {} as prismic.MigrationLinkToMediaField,
		contentRelationship: {} as prismic.ContentRelationshipField,
		migrationContentRelationship: {} as prismic.ContentRelationshipField,
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
				migrationImage: {} as prismic.MigrationImageField,
				link: {} as prismic.LinkField,
				migrationLink: {} as prismic.MigrationLinkField,
				linkToMedia: {} as prismic.LinkToMediaField,
				migrationLinkToMedia: {} as prismic.MigrationLinkToMediaField,
				contentRelationship: {} as prismic.ContentRelationshipField,
				migrationContentRelationship: {} as prismic.ContentRelationshipField,
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
					migrationImage: {} as prismic.MigrationImageField,
					link: {} as prismic.LinkField,
					migrationLink: {} as prismic.MigrationLinkField,
					linkToMedia: {} as prismic.LinkToMediaField,
					migrationLinkToMedia: {} as prismic.MigrationLinkToMediaField,
					contentRelationship: {} as prismic.ContentRelationshipField,
					migrationContentRelationship: {} as prismic.ContentRelationshipField,
					group: [
						{
							image: {} as prismic.ImageField,
							migrationImage: {} as prismic.MigrationImageField,
							link: {} as prismic.LinkField,
							migrationLink: {} as prismic.MigrationLinkField,
							linkToMedia: {} as prismic.LinkToMediaField,
							migrationLinkToMedia: {} as prismic.MigrationLinkToMediaField,
							contentRelationship: {} as prismic.ContentRelationshipField,
							migrationContentRelationship:
								{} as prismic.ContentRelationshipField,
						},
					],
				},
				items: [
					{
						image: {} as prismic.ImageField,
						migrationImage: {} as prismic.MigrationImageField,
						link: {} as prismic.LinkField,
						migrationLink: {} as prismic.MigrationLinkField,
						linkToMedia: {} as prismic.LinkToMediaField,
						migrationLinkToMedia: {} as prismic.MigrationLinkToMediaField,
						contentRelationship: {} as prismic.ContentRelationshipField,
						migrationContentRelationship:
							{} as prismic.ContentRelationshipField,
					},
				],
			},
		],
	},
})
