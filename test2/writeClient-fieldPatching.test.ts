import { describe, vi } from "vitest"

import type {
	ContentApiDocument,
	RepositoryManager,
} from "@prismicio/e2e-tests-utils"

import type { Fixtures } from "./it"
import { it } from "./it"

// The Migration API is slow and has low rate limits.
vi.setConfig({ testTimeout: 60000 })

type ForArgs = Pick<Fixtures, "docs">

const png = [
	Uint8Array.from(
		atob(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR4AWNgAAAAAgABc3UBGAAAAABJRU5ErkJggg==",
		),
		(c) => c.charCodeAt(0),
	),
]

describe.concurrent("image", () => {
	it("supports asset", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const image = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, { image }),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.image.origin.id).toBe(image.asset?.id)
		expect(data.image.url).toBe(image.asset?.url)
	})

	it("supports image field", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const image = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, { image: { id: image } }),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.image.origin.id).toBe(image.asset?.id)
		expect(data.image.url).toBe(image.asset?.url)
	})

	it("supports thumbnails", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const file2 = new File(png, crypto.randomUUID())
		const image = migration.createAsset(file, file.name)
		const square = migration.createAsset(file2, file2.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, { image: { id: image, square } }),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.image.origin.id).toBe(image.asset?.id)
		expect(data.image.url).toBe(image.asset?.url)
		expect(data.image.thumbnails.square.origin.id).toBe(square.asset?.id)
		expect(data.image.thumbnails.square.url).toBe(square.asset?.url)
	})

	it("supports external assets", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
		getAsset,
	}) => {
		const url =
			"https://images.prismic.io/prismic-main/a1307082-512a-4088-bace-30cdae70148e_stairs.jpg?w=100"
		// Simulate an external document by setting unknown IDs
		const doc = migration.createDocumentFromPrismic(
			{
				...docs.default,
				id: randomDocID(),
				uid: crypto.randomUUID(),
				data: {
					image: {
						id: randomDocID(),
						url,
						dimensions: {
							width: 100,
							height: 60,
						},
						edit: {
							x: 0,
							y: 0,
							zoom: 1,
							background: "transparent",
						},
						alt: "alt",
						copyright: "copyright",
					},
				},
			},
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		const asset = await getAsset({ id: doc.document.data.image.id.asset.id })
		expect(data.image.origin.id).toBe(asset.id)
		expect(data.image.url).toBe(asset.url)
	})
})

describe.concurrent("link to media", () => {
	it("supports asset", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const asset = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				link: { link_type: "Media", id: asset },
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.link.id).toBe(asset.asset?.id)
	})

	it("supports text", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const asset = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				link: { link_type: "Media", id: asset, text: "Download" },
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.link.id).toBe(asset.asset?.id)
		expect(data.link.text).toBe("Download")
	})

	it("supports non-image files", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(["%PDF-1.4"], "document.pdf", {
			type: "application/pdf",
		})
		const asset = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				link: { link_type: "Media", id: asset },
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.link.id).toBe(asset.asset?.id)
		expect(data.link.url).toMatch(/.pdf$/)
	})
})

describe.concurrent("content relationship", () => {
	it.for([
		({ docs }: ForArgs) => docs.default,
		({ docs }: ForArgs) => [() => docs.default][0],
		({ docs }: ForArgs) => ({ link_type: "Document", id: docs.default }),
		({ docs }: ForArgs) => ({ link_type: "Document", id: () => docs.default }),
		({ docs }: ForArgs) => ({ link_type: "Document", id: docs.default.id }),
	])(
		"supports documents: %s",
		async (field, { expect, writeClient, migration, docs, repository }) => {
			const doc = migration.createDocument(
				buildDocData(docs.default, {
					link: field({ docs }),
				}),
				"title",
			)
			await writeClient.migrate(migration)
			const data = await getMigrationReleaseDocData(doc.document.id, {
				repository,
			})
			expect(data.link.id).toBe(docs.default.id)
		},
	)

	it("supports release documents", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const doc1 = migration.createDocument(buildDocData(docs.default), "title")
		const doc2 = migration.createDocument(
			buildDocData(docs.default, { link: doc1 }),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc2.document.id, {
			repository,
		})
		expect(data.link.id).toBe(doc1.document.id)
	})

	it("supports lazy release documents", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const doc1 = migration.createDocument(buildDocData(docs.default), "title")
		const doc2 = migration.createDocument(
			buildDocData(docs.default, { link: () => doc1 }),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc2.document.id, {
			repository,
		})
		expect(data.link.id).toBe(doc1.document.id)
	})

	it("supports external documents", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		// Simulate an external document by setting unknown IDs
		const doc1 = migration.createDocumentFromPrismic(
			{
				...docs.default,
				id: randomDocID(),
				uid: crypto.randomUUID(),
			},
			"title",
		)
		const doc2 = migration.createDocumentFromPrismic(
			{
				...docs.default,
				id: randomDocID(),
				uid: crypto.randomUUID(),
				data: {
					link: {
						link_type: "Document",
						id: doc1.originalPrismicDocument?.id,
						type: doc1.originalPrismicDocument?.type,
						tags: doc1.originalPrismicDocument?.tags,
						lang: doc1.originalPrismicDocument?.lang,
					},
				},
			},
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc2.document.id, {
			repository,
		})
		expect(data.link.id).toBe(doc1.document.id)
	})

	it("supports text", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				link: {
					link_type: "Document",
					id: docs.default.id,
					text: "foo",
				},
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.link.id).toBe(docs.default.id)
		expect(data.link.text).toBe("foo")
	})

	it("supports variant", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				var_link: {
					link_type: "Document",
					id: docs.default.id,
					variant: "foo",
				},
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.var_link.id).toBe(docs.default.id)
		expect(data.var_link.variant).toBe("foo")
	})
})

describe.concurrent("rich text", () => {
	it("supports image nodes", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const image = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				richtext: [{ type: "image", id: image }],
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.richtext[0].data.origin.id).toBe(image.asset?.id)
		expect(data.richtext[0].data.url).toBe(image.asset?.url)
	})

	it("supports image nodes with linkTo", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const image = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				richtext: [{ type: "image", id: image, linkTo: docs.default }],
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.richtext[0].data.origin.id).toBe(image.asset?.id)
		expect(data.richtext[0].data.linkTo.id).toBe(docs.default.id)
	})

	it("supports external image assets", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
		getAsset,
	}) => {
		const url =
			"https://images.prismic.io/prismic-main/a1307082-512a-4088-bace-30cdae70148e_stairs.jpg?w=100"
		const doc = migration.createDocumentFromPrismic(
			{
				...docs.default,
				id: randomDocID(),
				uid: crypto.randomUUID(),
				data: {
					richtext: [
						{
							type: "image",
							id: randomDocID(),
							url,
							dimensions: { width: 100, height: 60 },
							edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
							alt: "alt",
							copyright: "copyright",
						},
					],
				},
			},
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		const asset = await getAsset({
			id: doc.document.data.richtext[0].id.asset.id,
		})
		expect(data.richtext[0].data.origin.id).toBe(asset.id)
		expect(data.richtext[0].data.url).toBe(asset.url)
	})

	it("supports link to asset", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const file = new File(png, crypto.randomUUID())
		const asset = migration.createAsset(file, file.name)
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				richtext: [
					{
						type: "paragraph",
						text: "Download file",
						spans: [
							{
								type: "hyperlink",
								start: 0,
								end: 8,
								data: { link_type: "Media", id: asset },
							},
						],
					},
				],
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.richtext[0].content.spans[0].data.id).toBe(asset.asset?.id)
	})

	it("supports link to document", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const doc = migration.createDocument(
			buildDocData(docs.default, {
				richtext: [
					{
						type: "paragraph",
						text: "Link text",
						spans: [
							{ type: "hyperlink", start: 0, end: 4, data: docs.default2 },
						],
					},
				],
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc.document.id, {
			repository,
		})
		expect(data.richtext[0].content.spans[0].data.id).toBe(docs.default2.id)
	})

	it("supports link to release document", async ({
		expect,
		writeClient,
		migration,
		docs,
		repository,
	}) => {
		const doc1 = migration.createDocument(
			buildDocData(docs.default2, {}),
			"title",
		)
		const doc2 = migration.createDocument(
			buildDocData(docs.default, {
				richtext: [
					{
						type: "paragraph",
						text: "Link text",
						spans: [{ type: "hyperlink", start: 0, end: 4, data: doc1 }],
					},
				],
			}),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc2.document.id, {
			repository,
		})
		expect(data.richtext[0].content.spans[0].data.id).toBe(doc1.document.id)
	})
})

function randomDocID() {
	return crypto.randomUUID().replaceAll("-", "").slice(0, 16)
}

function buildDocData(
	baseDoc: ContentApiDocument,
	data: Record<string, unknown> = {},
) {
	return {
		type: baseDoc.type,
		lang: baseDoc.lang,
		uid: baseDoc.uid ? crypto.randomUUID() : undefined,
		data,
	}
}

async function getMigrationReleaseDocData(
	id: string | undefined,
	args: { repository: RepositoryManager },
) {
	const { repository } = args

	const release = await repository.getMigrationRelease()
	const docs = await repository.getDocuments({
		statuses: [`release:${release.id}`],
	})
	const versionID = docs.results.find((result) => result.id === id)!.versions[0]
		.version_id

	return await repository.getDocumentData(versionID)
}
