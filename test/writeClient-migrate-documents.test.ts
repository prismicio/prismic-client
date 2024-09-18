import type { TestContext } from "vitest"
import { it as _it, expect, vi } from "vitest"

import { createPagedQueryResponses } from "./__testutils__/createPagedQueryResponses"
import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"
import { mockPrismicMigrationAPI } from "./__testutils__/mockPrismicMigrationAPI"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import * as prismic from "../src"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

const createRepository = (
	ctx: TestContext,
	masterLocale = "en-us",
): {
	repository: prismic.Repository
	masterLocale: string
} => {
	const repository = ctx.mock.api.repository()
	repository.languages[0].id = masterLocale
	repository.languages[0].is_master = true

	return { repository, masterLocale }
}

it.concurrent("infers master locale", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { repository, masterLocale } = createRepository(ctx)

	mockPrismicRestAPIV2({ ctx, repositoryResponse: repository })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:masterLocale",
		data: { masterLocale },
	})
})

it.concurrent("skips creating existing documents", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const queryResponse = createPagedQueryResponses({
		ctx,
		pages: 1,
		pageSize: 1,
	})
	const document = queryResponse[0].results[0]

	mockPrismicRestAPIV2({ ctx, queryResponse })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({ ctx, client, existingDocuments: [document] })

	const migration = prismic.createMigration()

	migration.updateDocument(document, "foo")

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:created",
		data: {
			created: 0,
		},
	})
})

it.concurrent("creates new documents", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { id: _id, ...document } = ctx.mock.value.document()
	const newDocument = { id: "foo" }

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({
		ctx,
		client,
		newDocuments: [newDocument],
	})

	const migration = prismic.createMigration()

	const doc = migration.createDocument(document, "foo")

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:creating",
		data: {
			current: 1,
			remaining: 0,
			total: 1,
			document: doc,
		},
	})
	expect(doc.document.id).toBe(newDocument.id)
})

it.concurrent(
	"creates new non-master locale document with direct reference (existing document)",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const queryResponse = createPagedQueryResponses({
			ctx,
			pages: 1,
			pageSize: 1,
		})

		const masterLanguageDocument = queryResponse[0].results[0]
		const { id: _id, ...document } = ctx.mock.value.document()
		const newDocument = {
			id: "foo",
			masterLanguageDocumentID: masterLanguageDocument.id,
		}

		mockPrismicRestAPIV2({ ctx, queryResponse })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [newDocument] })

		const migration = prismic.createMigration()

		const doc = migration.createDocument(document, "foo", {
			masterLanguageDocument,
		})

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		ctx.expect(reporter).toHaveBeenCalledWith({
			type: "documents:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				document: doc,
			},
		})
		ctx.expect(migration._documents[0].document.id).toBe(newDocument.id)
		ctx.expect.assertions(3)
	},
)

it.concurrent(
	"creates new non-master locale document with direct reference (new document)",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const { id: masterLanguageDocumentID, ...masterLanguageDocument } =
			ctx.mock.value.document()
		const { id: documentID, ...document } = ctx.mock.value.document()
		const newDocuments = [
			{
				id: masterLanguageDocumentID,
			},
			{
				id: documentID,
				masterLanguageDocumentID: masterLanguageDocumentID,
			},
		]

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [...newDocuments] })

		const migration = prismic.createMigration()

		const masterLanguageMigrationDocument = migration.createDocument(
			masterLanguageDocument,
			"foo",
		)
		const doc = migration.createDocument(document, "bar", {
			masterLanguageDocument: masterLanguageMigrationDocument,
		})

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		ctx
			.expect(masterLanguageMigrationDocument.document.id)
			.toBe(newDocuments[0].id)
		ctx.expect(doc.document.id).toBe(newDocuments[1].id)
		ctx.expect.assertions(3)
	},
)

it.concurrent(
	"creates new non-master locale document with lazy reference (existing document)",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const queryResponse = createPagedQueryResponses({
			ctx,
			pages: 1,
			pageSize: 1,
		})

		const masterLanguageDocument = queryResponse[0].results[0]
		const { id: _id, ...document } = ctx.mock.value.document()
		const newDocument = {
			id: "foo",
			masterLanguageDocumentID: masterLanguageDocument.id,
		}

		mockPrismicRestAPIV2({ ctx, queryResponse })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [newDocument] })

		const migration = prismic.createMigration()

		const doc = migration.createDocument(document, "foo", {
			masterLanguageDocument: () => masterLanguageDocument,
		})

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		ctx.expect(reporter).toHaveBeenCalledWith({
			type: "documents:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				document: doc,
			},
		})
		ctx.expect(doc.document.id).toBe(newDocument.id)
		ctx.expect.assertions(3)
	},
)

it.concurrent(
	"creates new non-master locale document with lazy reference (new document)",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const { id: masterLanguageDocumentID, ...masterLanguageDocument } =
			ctx.mock.value.document()
		const { id: documentID, ...document } = ctx.mock.value.document()
		const newDocuments = [
			{
				id: masterLanguageDocumentID,
			},
			{
				id: documentID,
				masterLanguageDocumentID: masterLanguageDocumentID,
			},
		]

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [...newDocuments] })

		const migration = prismic.createMigration()

		const masterLanguageMigrationDocument = migration.createDocument(
			masterLanguageDocument,
			"foo",
		)
		const doc = migration.createDocument(document, "bar", {
			masterLanguageDocument: () => masterLanguageMigrationDocument,
		})

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		ctx
			.expect(masterLanguageMigrationDocument.document.id)
			.toBe(newDocuments[0].id)
		ctx.expect(doc.document.id).toBe(newDocuments[1].id)
		ctx.expect.assertions(3)
	},
)

it.concurrent(
	"creates new non-master locale document with lazy reference (empty)",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const { id: documentID, ...document } = ctx.mock.value.document()
		const newDocuments = [
			{
				id: documentID,
				masterLanguageDocumentID: undefined,
			},
		]

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [...newDocuments] })

		const migration = prismic.createMigration()

		const doc = migration.createDocument(document, "bar", {
			masterLanguageDocument: () => undefined,
		})

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		ctx.expect(doc.document.id).toBe(newDocuments[0].id)
		ctx.expect.assertions(1)
	},
)

it.concurrent(
	"creates new non-master locale document with alternate language",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const { repository, masterLocale } = createRepository(ctx)

		const masterLanguageDocument = ctx.mock.value.document()
		masterLanguageDocument.lang = masterLocale
		const document = ctx.mock.value.document({
			alternateLanguages: [masterLanguageDocument],
		})
		const newDocuments = [
			{
				id: "foo",
			},
			{
				id: "bar",
				masterLanguageDocumentID: "foo",
			},
		]

		mockPrismicRestAPIV2({ ctx, repositoryResponse: repository })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments })

		const migration = prismic.createMigration()

		migration.createDocumentFromPrismic(masterLanguageDocument, "foo")
		const doc = migration.createDocumentFromPrismic(document, "bar")

		const reporter = vi.fn()

		await client.migrate(migration, { reporter })

		ctx.expect(reporter).toHaveBeenCalledWith({
			type: "documents:creating",
			data: {
				current: 2,
				remaining: 0,
				total: 2,
				document: doc,
			},
		})
		ctx.expect(doc.document.id).toBe("bar")
		ctx.expect.assertions(3)
	},
)

it.concurrent("creates master locale documents first", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { repository, masterLocale } = createRepository(ctx)

	const { id: masterLanguageDocumentID, ...masterLanguageDocument } =
		ctx.mock.value.document()
	masterLanguageDocument.lang = masterLocale
	const { id: documentID, ...document } = ctx.mock.value.document()
	const newDocuments = [
		{
			id: masterLanguageDocumentID,
		},
		{
			id: documentID,
		},
	]

	mockPrismicRestAPIV2({ ctx, repositoryResponse: repository })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({ ctx, client, newDocuments: [...newDocuments] })

	const migration = prismic.createMigration()

	const doc = migration.createDocument(document, "bar")
	const masterLanguageMigrationDocument = migration.createDocument(
		masterLanguageDocument,
		"foo",
	)

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	ctx
		.expect(masterLanguageMigrationDocument.document.id)
		.toBe(newDocuments[0].id)
	ctx.expect(doc.document.id).toBe(newDocuments[1].id)
})
