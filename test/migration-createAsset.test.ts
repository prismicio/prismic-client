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

	expect(migration._assets.get(file)?.config).toEqual({
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

	expect(migration._assets.get(file)?.config).toEqual({
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

	expect(migration._assets.get(asset.id)?.config).toStrictEqual({
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

	expect(migration._assets.get(image.id)?.config).toEqual({
		id: image.id,
		file: image.url,
		filename: image.url.split("/").pop(),
		alt: image.alt,
		credits: image.copyright,
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

	expect(migration._assets.get(link.id)?.config).toEqual({
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
	}, "notes").toThrowError(/`notes` must be at most 500 characters/i)

	expect(() => {
		migration.createAsset(file, filename, { credits: "0".repeat(501) })
	}, "credits").toThrowError(/`credits` must be at most 500 characters/i)

	expect(() => {
		migration.createAsset(file, filename, { alt: "0".repeat(501) })
	}, "alt").toThrowError(/`alt` must be at most 500 characters/i)

	expect(() => {
		migration.createAsset(file, filename, { tags: ["0"] })
	}, "tags").toThrowError(
		/tags must be at least 3 characters long and 20 characters at most/i,
	)

	expect(() => {
		migration.createAsset(file, filename, { tags: ["0".repeat(21)] })
	}, "tags").toThrowError(
		/tags must be at least 3 characters long and 20 characters at most/i,
	)

	expect(() => {
		migration.createAsset(file, filename, { tags: ["012"] })
	}, "tags").not.toThrowError()
})

it("consolidates existing assets with additional metadata", () => {
	const migration = prismic.createMigration()

	const filename = "foo.jpg"
	const file = "https://example.com/foo.jpg"

	migration.createAsset(file, filename)

	expect(migration._assets.get(file)?.config).toStrictEqual({
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

	expect(migration._assets.get(file)?.config).toStrictEqual({
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

	expect(migration._assets.get(file)?.config).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag", "tag 2"],
	})

	migration.createAsset(file, filename)

	expect(migration._assets.get(file)?.config).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag", "tag 2"],
	})
})
