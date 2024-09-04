import { it as _it, expect } from "vitest"

import * as prismic from "../src"
import type { Asset } from "../src/types/api/asset/asset"
import { AssetType } from "../src/types/api/asset/asset"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

it("creates an asset from a url", () => {
	const migration = prismic.createMigration()

	const filename = "foo.jpg"
	const file = "https://example.com/foo.jpg"

	migration.createAsset(file, filename)

	expect(migration.assets.get(file)).toEqual({
		id: file,
		file,
		filename,
	})
})

it("creates an asset from a file", () => {
	const migration = prismic.createMigration()

	const filename = "foo.jpg"
	const file = new File(["data"], filename)

	migration.createAsset(file, filename)

	expect(migration.assets.get(file)).toEqual({
		id: file,
		file,
		filename,
	})
})

it("creates an asset from an existing asset", () => {
	const migration = prismic.createMigration()

	const asset: Asset = {
		id: "foo",
		url: "https://example.com/foo.jpg",
		created_at: 0,
		last_modified: 0,
		filename: "foo.jpg",
		extension: "jpg",
		size: 1,
		kind: AssetType.Image,
		width: 1,
		height: 1,
		notes: "notes",
		credits: "credits",
		alt: "alt",
		tags: [
			{
				name: "tag",
				id: "id",
				created_at: 0,
				last_modified: 0,
				uploader_id: "uploader_id",
			},
		],
	}

	migration.createAsset(asset)

	expect(migration.assets.get(asset.id)).toStrictEqual({
		id: asset.id,
		file: asset.url,
		filename: asset.filename,
		alt: asset.alt,
		credits: asset.credits,
		notes: asset.notes,
		tags: asset.tags?.map(({ name }) => name),
	})
})

it("creates an asset from an image field", () => {
	const migration = prismic.createMigration()

	const image: prismic.FilledImageFieldImage = {
		id: "foo",
		url: "https://example.com/foo.jpg",
		alt: "alt",
		copyright: "copyright",
		dimensions: { width: 1, height: 1 },
		edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
	}

	migration.createAsset(image)

	expect(migration.assets.get(image.id)).toEqual({
		id: image.id,
		file: image.url,
		filename: image.url.split("/").pop(),
		alt: image.alt,
		credits: image.copyright,
	})

	const image2: prismic.FilledImageFieldImage = {
		...image,
		id: "bar",
		url: "https://example.com/",
	}

	migration.createAsset(image2)

	expect(
		migration.assets.get(image2.id),
		"uses alt as filename fallback when filename cannot be inferred from URL",
	).toEqual({
		id: image2.id,
		file: image2.url,
		filename: image2.alt,
		alt: image2.alt,
		credits: image2.copyright,
	})

	const image3: prismic.FilledImageFieldImage = {
		...image,
		id: "qux",
		alt: "",
		url: "https://example.com/",
	}

	migration.createAsset(image3)

	expect(
		migration.assets.get(image3.id),
		"uses default filename when filename cannot be inferred from URL and `alt` is not available",
	).toEqual({
		id: image3.id,
		file: image3.url,
		filename: "unknown",
		credits: image3.copyright,
	})
})

it("creates an asset from a link to media field", () => {
	const migration = prismic.createMigration()

	const link: prismic.FilledLinkToMediaField = {
		id: "foo",
		url: "https://example.com/foo.jpg",
		link_type: prismic.LinkType.Media,
		kind: AssetType.Image,
		name: "foo.jpg",
		size: "1",
		height: "1",
		width: "1",
	}

	migration.createAsset(link)

	expect(migration.assets.get(link.id)).toEqual({
		id: link.id,
		file: link.url,
		filename: link.name,
	})
})

it("throws if asset has invalid metadata", () => {
	const migration = prismic.createMigration()

	const filename = "foo.jpg"
	const file = "https://example.com/foo.jpg"

	expect(() => {
		migration.createAsset(file, filename, { notes: "0".repeat(501) })
	}, "notes").toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: \`notes\` must be at most 500 characters]`,
	)

	expect(() => {
		migration.createAsset(file, filename, { credits: "0".repeat(501) })
	}, "credits").toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: \`credits\` must be at most 500 characters]`,
	)

	expect(() => {
		migration.createAsset(file, filename, { alt: "0".repeat(501) })
	}, "alt").toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: \`alt\` must be at most 500 characters]`,
	)

	expect(() => {
		migration.createAsset(file, filename, { tags: ["0"] })
	}, "tags").toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: all \`tags\`'s tag must be at least 3 characters long and 20 characters at most]`,
	)

	expect(() => {
		migration.createAsset(file, filename, { tags: ["0".repeat(21)] })
	}, "tags").toThrowErrorMatchingInlineSnapshot(
		`[Error: Errors validating asset metadata: all \`tags\`'s tag must be at least 3 characters long and 20 characters at most]`,
	)

	expect(() => {
		migration.createAsset(file, filename, {
			tags: [
				// Tag name
				"012",
				// Tag ID
				"123e4567-e89b-12d3-a456-426614174000",
			],
		})
	}, "tags").not.toThrowError()
})

it("consolidates existing assets with additional metadata", () => {
	const migration = prismic.createMigration()

	const filename = "foo.jpg"
	const file = "https://example.com/foo.jpg"

	migration.createAsset(file, filename)

	expect(migration.assets.get(file)).toStrictEqual({
		id: file,
		file,
		filename,
		notes: undefined,
		alt: undefined,
		credits: undefined,
		tags: undefined,
	})

	migration.createAsset(file, filename, {
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag"],
	})

	expect(migration.assets.get(file)).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag"],
	})

	migration.createAsset(file, filename, {
		notes: "notes 2",
		alt: "alt 2",
		credits: "credits 2",
		tags: ["tag", "tag 2"],
	})

	expect(migration.assets.get(file)).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes 2",
		alt: "alt 2",
		credits: "credits 2",
		tags: ["tag", "tag 2"],
	})

	migration.createAsset(file, filename)

	expect(migration.assets.get(file)).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes 2",
		alt: "alt 2",
		credits: "credits 2",
		tags: ["tag", "tag 2"],
	})
})
