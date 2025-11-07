import { it } from "./it"

import type { FilledImageFieldImage, FilledLinkToMediaField } from "../src"
import { PrismicMigrationAsset } from "../src"
import type { Asset } from "../src/types/api/asset/asset"

it("creates an asset from a url", async ({ expect, migration }) => {
	const file = "https://example.com/foo.jpg"
	const res = migration.createAsset(file, "foo.jpg")
	expect(res).toBeInstanceOf(PrismicMigrationAsset)
	expect(res.config).toMatchObject({ id: file, file, filename: "foo.jpg" })
	expect(migration._assets).toHaveEntry(file, res)
})

it("creates an asset from a file", async ({ expect, migration }) => {
	const file = new File(["data"], "foo.jpg")
	const res = migration.createAsset(file, file.name)
	expect(res).toBeInstanceOf(PrismicMigrationAsset)
	expect(res.config).toMatchObject({ id: file, file, filename: "foo.jpg" })
	expect(migration._assets).toHaveEntry(file, res)
})

it("creates an asset from an existing asset", async ({ expect, migration }) => {
	const asset: Asset = {
		id: "foo",
		url: "https://example.com/foo.jpg",
		created_at: 0,
		last_modified: 0,
		filename: "foo.jpg",
		extension: "jpg",
		size: 1,
		kind: "image",
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
	const res = migration.createAsset(asset)
	expect(res).toBeInstanceOf(PrismicMigrationAsset)
	expect(res.config).toMatchObject({
		id: asset.id,
		file: asset.url,
		filename: asset.filename,
		alt: asset.alt,
		credits: asset.credits,
		notes: asset.notes,
		tags: asset.tags?.map(({ name }) => name),
	})
	expect(migration._assets).toHaveEntry(asset.id, res)
})

it("creates an asset from an image field", async ({ expect, migration }) => {
	const image: FilledImageFieldImage = {
		id: "foo",
		url: "https://example.com/foo.jpg",
		alt: "alt",
		copyright: "copyright",
		dimensions: { width: 1, height: 1 },
		edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
	}
	const res = migration.createAsset(image)
	expect(res).toBeInstanceOf(PrismicMigrationAsset)
	expect(res.config).toMatchObject({
		id: image.id,
		file: image.url,
		filename: image.url.split("/").pop(),
		alt: image.alt,
		credits: image.copyright,
	})
	expect(migration._assets).toHaveEntry(image.id, res)
})

it("creates an asset from a link to media field", async ({
	expect,
	migration,
}) => {
	const link: FilledLinkToMediaField = {
		id: "foo",
		url: "https://example.com/foo.jpg",
		link_type: "Media",
		kind: "image",
		name: "foo.jpg",
		size: "1",
		height: "1",
		width: "1",
	}
	const res = migration.createAsset(link)
	expect(res).toBeInstanceOf(PrismicMigrationAsset)
	expect(res.config).toMatchObject({
		id: link.id,
		file: link.url,
		filename: link.name,
	})
	expect(migration._assets).toHaveEntry(link.id, res)
})

it("supports alt text", async ({ expect, migration }) => {
	const res = migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
		alt: "alt",
	})
	expect(res.config).toMatchObject({ alt: "alt" })
})

it("supports tags", async ({ expect, migration }) => {
	const res = migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
		tags: ["tag"],
	})
	expect(res.config).toMatchObject({ tags: ["tag"] })
})

it("supports notes", async ({ expect, migration }) => {
	const res = migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
		notes: "notes",
	})
	expect(res.config).toMatchObject({ notes: "notes" })
})

it("supports credits", async ({ expect, migration }) => {
	const res = migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
		credits: "credits",
	})
	expect(res.config).toMatchObject({ credits: "credits" })
})

it("throws if notes exceeds 500 characters", async ({ expect, migration }) => {
	expect(() =>
		migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
			notes: "0".repeat(501),
		}),
	).toThrow(/`notes` must be at most 500 characters/i)
})

it("throws if credits exceeds 500 characters", async ({
	expect,
	migration,
}) => {
	expect(() =>
		migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
			credits: "0".repeat(501),
		}),
	).toThrow(/`credits` must be at most 500 characters/i)
})

it("throws if alt exceeds 500 characters", async ({ expect, migration }) => {
	expect(() =>
		migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
			alt: "0".repeat(501),
		}),
	).toThrow(/`alt` must be at most 500 characters/i)
})

it("throws if tags are too short", async ({ expect, migration }) => {
	expect(() =>
		migration.createAsset("foo.jpg", "https://example.com/foo.jpg", {
			tags: ["0"],
		}),
	).toThrow(
		/tags must be at least 3 characters long and 20 characters at most/i,
	)
})

it("throws if tags are too long", async ({ expect, migration }) => {
	expect(() =>
		migration.createAsset("https://example.com/foo.jpg", "foo.jpg", {
			tags: ["0".repeat(21)],
		}),
	).toThrow(
		/tags must be at least 3 characters long and 20 characters at most/i,
	)
})

it("adds metadata to existing asset", async ({ expect, migration }) => {
	const file = "https://example.com/foo.jpg"
	const filename = "foo.jpg"
	const res = migration.createAsset(file, filename)
	migration.createAsset(file, filename, {
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag"],
	})
	expect(res.config).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag"],
	})
})

it("preserves original metadata when adding new metadata", async ({
	expect,
	migration,
}) => {
	const file = "https://example.com/foo.jpg"
	const filename = "foo.jpg"
	const res = migration.createAsset(file, filename, {
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
	expect(res.config).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag", "tag 2"],
	})
})

it("preserves metadata when asset created again without metadata", async ({
	expect,
	migration,
}) => {
	const file = "https://example.com/foo.jpg"
	const filename = "foo.jpg"
	const res = migration.createAsset(file, filename, {
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag"],
	})
	migration.createAsset(file, filename)
	expect(res.config).toStrictEqual({
		id: file,
		file,
		filename,
		notes: "notes",
		alt: "alt",
		credits: "credits",
		tags: ["tag"],
	})
})
