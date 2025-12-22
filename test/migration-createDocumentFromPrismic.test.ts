import { describe } from "vitest"

import { it } from "./it"

import type { ImageField, LinkToMediaField } from "../src"
import { PrismicMigrationDocument } from "../src"

const image: ImageField = {
	id: "foo",
	url: "https://example.com/foo.jpg",
	alt: "alt",
	copyright: "copyright",
	dimensions: { width: 1, height: 1 },
	edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
}

const linkToMedia: LinkToMediaField = {
	link_type: "Media",
	id: "bar",
	url: "https://example.com/bar.pdf",
	kind: "document",
	name: "bar.pdf",
	size: "1000",
	height: undefined,
	width: undefined,
}

it("returns a migration document from an existing Prismic document", async ({
	expect,
	migration,
	docs,
}) => {
	const { type, uid, lang, tags, data } = docs.default
	const res = migration.createDocumentFromPrismic(docs.default, "title")
	expect(res).toBeInstanceOf(PrismicMigrationDocument)
	expect(res.document).toMatchObject({ type, uid, lang, tags, data })
	expect(res.originalPrismicDocument).toBe(docs.default)
	expect(res.title).toBe("title")
})

it("adds a Prismic document to the migration", async ({
	expect,
	docs,
	migration,
}) => {
	const res = migration.createDocumentFromPrismic(docs.default, "title")
	expect(migration._documents).toContain(res)
})

describe.each([
	{
		name: "image",
		field: image,
		id: image.id,
		expectedConfig: {
			alt: image.alt || undefined,
			credits: image.copyright || undefined,
			file: image.url.split("?")[0],
			filename: image.url.split("/").pop()!.split("?")[0],
			id: image.id,
			notes: undefined,
			tags: undefined,
		},
	},
	{
		name: "link to media",
		field: linkToMedia,
		id: linkToMedia.id,
		expectedConfig: {
			alt: undefined,
			credits: undefined,
			file: linkToMedia.url.split("?")[0],
			filename: linkToMedia.name,
			id: linkToMedia.id,
			notes: undefined,
			tags: undefined,
		},
	},
	{
		name: "rich text image",
		field: [
			{
				type: "image",
				...image,
			},
		],
		id: image.id,
		expectedConfig: {
			alt: image.alt || undefined,
			credits: image.copyright || undefined,
			file: image.url.split("?")[0],
			filename: image.url.split("/").pop()!.split("?")[0],
			id: image.id,
			notes: undefined,
			tags: undefined,
		},
	},
	{
		name: "rich text link to media span",
		field: [
			{
				type: "paragraph",
				text: "lorem",
				spans: [
					{
						start: 0,
						end: 5,
						type: "hyperlink",
						data: linkToMedia,
					},
				],
			},
		],
		id: linkToMedia.id,
		expectedConfig: {
			alt: undefined,
			credits: undefined,
			file: linkToMedia.url.split("?")[0],
			filename: linkToMedia.name,
			id: linkToMedia.id,
			notes: undefined,
			tags: undefined,
		},
	},
	{
		name: "rich text image's link to media",
		field: [
			{
				type: "image",
				linkTo: linkToMedia,
				...image,
			},
		],
		id: linkToMedia.id,
		expectedConfig: {
			alt: undefined,
			credits: undefined,
			file: linkToMedia.url.split("?")[0],
			filename: linkToMedia.name,
			id: linkToMedia.id,
			notes: undefined,
			tags: undefined,
		},
	},
])("$name", ({ id, field, expectedConfig }) => {
	it("extracts assets from regular fields", async ({
		expect,
		docs,
		migration,
	}) => {
		const document = { ...docs.default, data: { field } }
		migration.createDocumentFromPrismic(document, "title")
		expect(migration._assets.get(id)?.config).toStrictEqual(expectedConfig)
	})

	it("extracts assets from group fields", async ({
		expect,
		docs,
		migration,
	}) => {
		const document = { ...docs.default, data: { group: [{ field }] } }
		migration.createDocumentFromPrismic(document, "title")
		expect(migration._assets.get(id)?.config).toStrictEqual(expectedConfig)
	})

	it("extracts assets from slice primary fields", async ({
		expect,
		docs,
		migration,
	}) => {
		const document = {
			...docs.default,
			data: {
				slices: [
					{
						id: "id",
						slice_type: "slice_type",
						slice_label: "slice_label",
						primary: { field },
						items: [],
					},
				],
			},
		}
		migration.createDocumentFromPrismic(document, "title")
		expect(migration._assets.get(id)?.config).toStrictEqual(expectedConfig)
	})

	it("extracts assets from slice items", async ({
		expect,
		docs,
		migration,
	}) => {
		const document = {
			...docs.default,
			data: {
				slices: [
					{
						id: "id",
						slice_type: "slice_type",
						slice_label: "slice_label",
						primary: {},
						items: [{ field }],
					},
				],
			},
		}
		migration.createDocumentFromPrismic(document, "title")
		expect(migration._assets.get(id)?.config).toStrictEqual(expectedConfig)
	})
})
