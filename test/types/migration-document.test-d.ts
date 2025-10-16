import { assertType, expectTypeOf, it } from "vitest"

import type {
	ContentRelationshipField,
	EmbedField,
	GroupField,
	ImageField,
	KeyTextField,
	LinkToMediaField,
	MigrationContentRelationship,
	MigrationImage,
	MigrationLinkToMedia,
	PendingPrismicDocument,
	PrismicDocument,
	SharedSlice,
	SharedSliceVariation,
	SliceZone,
} from "../../src"

it("supports basic pending document structure", () => {
	assertType<PendingPrismicDocument>({
		uid: "",
		type: "",
		lang: "",
		data: {},
	})
})

it("supports any field when generic", () => {
	assertType<PendingPrismicDocument>({
		uid: "",
		type: "",
		lang: "",
		data: {
			any: "",
		},
	})
})

it("PrismicDocument is assignable to PendingPrismicDocument with added title", () => {
	expectTypeOf<
		PrismicDocument & { title: string }
	>().toExtend<PendingPrismicDocument>()
})

it("infers data type from document type", () => {
	type FooDocument = PrismicDocument<Record<string, never>, "foo">
	type BarDocument = PrismicDocument<{ bar: KeyTextField }, "bar">
	type BazDocument = PrismicDocument<Record<string, never>, "baz">
	type Documents = FooDocument | BarDocument | BazDocument

	type MigrationDocuments = PendingPrismicDocument<Documents>

	assertType<MigrationDocuments>({
		uid: "",
		type: "foo",
		lang: "",
		data: {},
	})

	// @ts-expect-error - `FooDocument` has no `bar` field in `data`
	assertType<MigrationDocuments>({
		uid: "",
		type: "foo",
		lang: "",
		data: {
			bar: "",
		},
	})

	assertType<MigrationDocuments>({
		uid: "",
		type: "bar",
		lang: "",
		data: {
			bar: "",
		},
	})

	// @ts-expect-error - `bar` is missing in `data`
	assertType<MigrationDocuments>({
		uid: "",
		type: "bar",
		lang: "",
		data: {},
	})
})

it("accepts migration field types", () => {
	type Fields = {
		image: ImageField
		migrationImage: ImageField
		linkToMedia: LinkToMediaField
		migrationLinkToMedia: LinkToMediaField
		contentRelationship: ContentRelationshipField
		migrationContentRelationship: ContentRelationshipField
		embedField: EmbedField
		migrationEmbedField: EmbedField
	}

	type StaticDocument = PrismicDocument<Fields, "static">
	type GroupDocument = PrismicDocument<{ group: GroupField<Fields> }, "group">
	type SliceDocument = PrismicDocument<
		{
			slices: SliceZone<
				SharedSlice<
					"default",
					SharedSliceVariation<
						"default",
						Fields & { group: GroupField<Fields> },
						Fields
					>
				>
			>
		},
		"slice"
	>
	type AdvancedDocuments = StaticDocument | GroupDocument | SliceDocument
	type MigrationAdvancedDocuments = PendingPrismicDocument<AdvancedDocuments>

	assertType<MigrationAdvancedDocuments>({
		uid: "",
		type: "static",
		lang: "",
		data: {
			image: {} as ImageField,
			migrationImage: {} as MigrationImage,
			linkToMedia: {} as LinkToMediaField,
			migrationLinkToMedia: {} as MigrationLinkToMedia,
			contentRelationship: {} as ContentRelationshipField,
			migrationContentRelationship: {} as MigrationContentRelationship,
			embedField: {} as EmbedField,
			migrationEmbedField: { embed_url: "https://example.com" },
		},
	})

	assertType<MigrationAdvancedDocuments>({
		uid: "",
		type: "group",
		lang: "",
		data: {
			group: [
				{
					image: {} as ImageField,
					migrationImage: {} as MigrationImage,
					linkToMedia: {} as LinkToMediaField,
					migrationLinkToMedia: {} as MigrationLinkToMedia,
					contentRelationship: {} as ContentRelationshipField,
					migrationContentRelationship: {} as MigrationContentRelationship,
					embedField: {} as EmbedField,
					migrationEmbedField: { embed_url: "https://example.com" },
				},
			],
		},
	})

	assertType<MigrationAdvancedDocuments>({
		uid: "",
		type: "slice",
		lang: "",
		data: {
			slices: [
				{
					slice_type: "default",
					variation: "default",
					primary: {
						image: {} as ImageField,
						migrationImage: {} as MigrationImage,
						linkToMedia: {} as LinkToMediaField,
						migrationLinkToMedia: {} as MigrationLinkToMedia,
						contentRelationship: {} as ContentRelationshipField,
						migrationContentRelationship: {} as MigrationContentRelationship,
						embedField: {} as EmbedField,
						migrationEmbedField: { embed_url: "https://example.com" },
						group: [
							{
								image: {} as ImageField,
								migrationImage: {} as MigrationImage,
								linkToMedia: {} as LinkToMediaField,
								migrationLinkToMedia: {} as MigrationLinkToMedia,
								contentRelationship: {} as ContentRelationshipField,
								migrationContentRelationship:
									{} as MigrationContentRelationship,
								embedField: {} as EmbedField,
								migrationEmbedField: { embed_url: "https://example.com" },
							},
						],
					},
					items: [
						{
							image: {} as ImageField,
							migrationImage: {} as MigrationImage,
							linkToMedia: {} as LinkToMediaField,
							migrationLinkToMedia: {} as MigrationLinkToMedia,
							contentRelationship: {} as ContentRelationshipField,
							migrationContentRelationship: {} as MigrationContentRelationship,
							embedField: {} as EmbedField,
							migrationEmbedField: { embed_url: "https://example.com" },
						},
					],
				},
			],
		},
	})
})
