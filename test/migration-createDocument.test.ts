import { describe, expect, it } from "vitest"

import type { MockFactory } from "@prismicio/mock"

import * as prismic from "../src"
import type { MigrationAsset } from "../src/types/migration/asset"

it("creates a document", () => {
	const migration = prismic.createMigration()

	const document: prismic.PrismicMigrationDocument = {
		type: "type",
		uid: "uid",
		lang: "lang",
		data: {},
	}
	const documentName = "documentName"

	migration.createDocument(document, documentName)

	expect(migration.documents[0]).toStrictEqual({
		document,
		params: { documentName },
	})
})

it("creates a document from an existing Prismic document", () => {
	const migration = prismic.createMigration()

	const document: prismic.PrismicDocument = {
		id: "id",
		type: "type",
		uid: "uid",
		lang: "lang",
		url: "url",
		href: "href",
		slugs: [],
		tags: [],
		linked_documents: [],
		first_publication_date: "0-0-0T0:0:0+0",
		last_publication_date: "0-0-0T0:0:0+0",
		alternate_languages: [],
		data: {},
	}
	const documentName = "documentName"

	migration.createDocument(document, documentName)

	expect(migration.documents[0]).toStrictEqual({
		document,
		params: { documentName },
	})
})

describe.each<{
	fieldType: string
	getField: (mock: MockFactory) => {
		id: string
		field:
			| prismic.FilledImageFieldImage
			| prismic.FilledLinkToMediaField
			| prismic.RichTextField<"filled">
		expected: MigrationAsset
	}
}>([
	{
		fieldType: "image",
		getField: (mock) => {
			const image = mock.value.image({ state: "filled" })

			return {
				id: image.id,
				field: image,
				expected: {
					alt: image.alt ?? undefined,
					credits: image.copyright ?? undefined,
					file: image.url.split("?")[0],
					filename: image.url.split("/").pop()!.split("?")[0],
					id: image.id,
					notes: undefined,
					tags: undefined,
				},
			}
		},
	},
	{
		fieldType: "link to media",
		getField: (mock) => {
			const linkToMedia = mock.value.linkToMedia({ state: "filled" })

			return {
				id: linkToMedia.id,
				field: linkToMedia,
				expected: {
					alt: undefined,
					credits: undefined,
					file: linkToMedia.url.split("?")[0],
					filename: linkToMedia.name,
					id: linkToMedia.id,
					notes: undefined,
					tags: undefined,
				},
			}
		},
	},
	{
		fieldType: "rich text (image)",
		getField: (mock) => {
			const image = mock.value.image({ state: "filled" })
			const richText: prismic.RichTextField<"filled"> = [
				{
					type: prismic.RichTextNodeType.image,
					...image,
				},
			]

			return {
				id: image.id,
				field: richText,
				expected: {
					alt: image.alt ?? undefined,
					credits: image.copyright ?? undefined,
					file: image.url.split("?")[0],
					filename: image.url.split("/").pop()!.split("?")[0],
					id: image.id,
					notes: undefined,
					tags: undefined,
				},
			}
		},
	},
	{
		fieldType: "rich text (link to media span)",
		getField: (mock) => {
			const linkToMedia = mock.value.linkToMedia({ state: "filled" })
			const richText = mock.value.richText({
				state: "filled",
			}) as prismic.RichTextField<"filled">

			richText.push({
				type: prismic.RichTextNodeType.paragraph,
				text: "lorem",
				spans: [
					{
						start: 0,
						end: 5,
						type: prismic.RichTextNodeType.hyperlink,
						data: linkToMedia,
					},
				],
			})

			return {
				id: linkToMedia.id,
				field: richText,
				expected: {
					alt: undefined,
					credits: undefined,
					file: linkToMedia.url.split("?")[0],
					filename: linkToMedia.name,
					id: linkToMedia.id,
					notes: undefined,
					tags: undefined,
				},
			}
		},
	},
	{
		fieldType: "rich text (image's link to media)",
		getField: (mock) => {
			const image = mock.value.image({ state: "filled" })
			const linkToMedia = mock.value.linkToMedia({ state: "filled" })
			const richText: prismic.RichTextField<"filled"> = [
				{
					type: prismic.RichTextNodeType.image,
					linkTo: linkToMedia,
					...image,
				},
			]

			return {
				id: linkToMedia.id,
				field: richText,
				expected: {
					alt: undefined,
					credits: undefined,
					file: linkToMedia.url.split("?")[0],
					filename: linkToMedia.name,
					id: linkToMedia.id,
					notes: undefined,
					tags: undefined,
				},
			}
		},
	},
])("extracts assets from image fields ($fieldType)", ({ getField }) => {
	it("regular fields", ({ mock }) => {
		const migration = prismic.createMigration()

		const { id, field, expected } = getField(mock)

		const document: prismic.PrismicMigrationDocument = {
			type: "type",
			uid: "uid",
			lang: "lang",
			data: { field },
		}
		const documentName = "documentName"

		expect(migration.assets.size).toBe(0)

		migration.createDocument(document, documentName)

		expect(migration.assets.get(id)).toStrictEqual(expected)
	})

	it("group fields", ({ mock }) => {
		const migration = prismic.createMigration()

		const { id, field, expected } = getField(mock)

		const document: prismic.PrismicMigrationDocument = {
			type: "type",
			uid: "uid",
			lang: "lang",
			data: { group: [{ field }] },
		}
		const documentName = "documentName"

		expect(migration.assets.size).toBe(0)

		migration.createDocument(document, documentName)

		expect(migration.assets.get(id)).toStrictEqual(expected)
	})

	it("slice's primary zone", ({ mock }) => {
		const migration = prismic.createMigration()

		const { id, field, expected } = getField(mock)

		const slices: prismic.SliceZone = [
			{
				id: "id",
				slice_type: "slice_type",
				slice_label: "slice_label",
				primary: { field },
				items: [],
			},
		]

		const document: prismic.PrismicMigrationDocument = {
			type: "type",
			uid: "uid",
			lang: "lang",
			data: { slices },
		}
		const documentName = "documentName"

		expect(migration.assets.size).toBe(0)

		migration.createDocument(document, documentName)

		expect(migration.assets.get(id)).toStrictEqual(expected)
	})

	it("slice's repeatable zone", ({ mock }) => {
		const migration = prismic.createMigration()

		const { id, field, expected } = getField(mock)

		const slices: prismic.SliceZone = [
			{
				id: "id",
				slice_type: "slice_type",
				slice_label: "slice_label",
				primary: {},
				items: [{ field }],
			},
		]

		const document: prismic.PrismicMigrationDocument = {
			type: "type",
			uid: "uid",
			lang: "lang",
			data: { slices },
		}
		const documentName = "documentName"

		expect(migration.assets.size).toBe(0)

		migration.createDocument(document, documentName)

		expect(migration.assets.get(id)).toStrictEqual(expected)
	})
})