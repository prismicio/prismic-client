import { describe, vi } from "vitest"

import type {
	ContentApiDocument,
	RepositoryManager,
} from "@prismicio/e2e-tests-utils"

import type { Fixtures } from "./it"
import { it } from "./it"

// The Migration API is slow and has low rate limits.
vi.setConfig({ testTimeout: 40000 })

type ForArgs = Pick<Fixtures, "docs">

describe("content relationship", () => {
	it.for([
		({ docs }: ForArgs) => docs.default,
		({ docs }: ForArgs) => [() => docs.default][0],
		({ docs }: ForArgs) => ({ link_type: "Document", id: docs.default }),
		({ docs }: ForArgs) => ({ link_type: "Document", id: () => docs.default }),
		({ docs }: ForArgs) => ({ link_type: "Document", id: docs.default.id }),
	])(
		"supports documents: %s",
		async (field, { expect, writeClient, migration, docs, repo }) => {
			const doc = migration.createDocument(
				buildDocData(docs.default, {
					link: field({ docs }),
				}),
				"title",
			)
			await writeClient.migrate(migration)
			const data = await getMigrationReleaseDocData(doc.document.id, { repo })
			expect(data.link.id).toBe(docs.default.id)
		},
	)

	it("supports release documents", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
	}) => {
		const doc1 = migration.createDocument(buildDocData(docs.default), "title")
		const doc2 = migration.createDocument(
			buildDocData(docs.default, { link: doc1 }),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc2.document.id, { repo })
		expect(data.link.id).toBe(doc1.document.id)
	})

	it("supports lazy release documents", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
	}) => {
		const doc1 = migration.createDocument(buildDocData(docs.default), "title")
		const doc2 = migration.createDocument(
			buildDocData(docs.default, { link: () => doc1 }),
			"title",
		)
		await writeClient.migrate(migration)
		const data = await getMigrationReleaseDocData(doc2.document.id, { repo })
		expect(data.link.id).toBe(doc1.document.id)
	})

	it("supports external documents", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
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
		await writeClient.migrate(migration).catch((e) => {
			console.debug(e)
			throw e
		})
		const data = await getMigrationReleaseDocData(doc2.document.id, { repo })
		expect(data.link.id).toBe(doc1.document.id)
	})

	it("supports text", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
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
		const data = await getMigrationReleaseDocData(doc.document.id, { repo })
		expect(data.link.id).toBe(docs.default.id)
		expect(data.link.text).toBe("foo")
	})

	it("supports variant", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
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
		const data = await getMigrationReleaseDocData(doc.document.id, { repo })
		expect(data.var_link.id).toBe(docs.default.id)
		expect(data.var_link.variant).toBe("foo")
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
	args: { repo: RepositoryManager },
) {
	const { repo } = args

	const release = await repo.getMigrationRelease()
	const versionID = release.results.find((result) => result.id === id)!
		.versions[0].version_id

	return await repo.getDocumentVersionData(versionID)
}
