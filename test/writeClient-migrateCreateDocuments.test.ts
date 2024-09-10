import type { TestContext } from "vitest"
import { it as _it, expect, vi } from "vitest"

import { createPagedQueryResponses } from "./__testutils__/createPagedQueryResponses"
import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicAssetAPI } from "./__testutils__/mockPrismicAssetAPI"
import { mockPrismicMigrationAPI } from "./__testutils__/mockPrismicMigrationAPI"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"

import * as prismic from "../src"
import type { DocumentMap } from "../src/lib/patchMigrationDocumentData"

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

it.concurrent("discovers existing documents", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const queryResponse = createPagedQueryResponses({
		ctx,
		pages: 2,
		pageSize: 1,
	})

	mockPrismicRestAPIV2({ ctx, queryResponse })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({ ctx, client })

	const migration = prismic.createMigration()

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:existing",
		data: {
			existing: 2,
		},
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

	migration.createDocument(document, "foo")

	const reporter = vi.fn()

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:skipping",
		data: {
			reason: "already exists",
			current: 1,
			remaining: 0,
			total: 1,
			document,
			documentParams: {
				documentTitle: "foo",
			},
		},
	})
	expect(reporter).toHaveBeenCalledWith({
		type: "documents:created",
		data: {
			created: 0,
			documents: expect.anything(),
		},
	})
})

it.concurrent("creates new documents", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const document = ctx.mock.value.document()
	const newDocument = { id: "foo" }

	mockPrismicRestAPIV2({ ctx })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({
		ctx,
		client,
		newDocuments: [newDocument],
	})

	const migration = prismic.createMigration()

	migration.createDocument(document, "foo")

	let documents: DocumentMap | undefined
	const reporter = vi.fn<(event: prismic.MigrateReporterEvents) => void>(
		(event) => {
			if (event.type === "documents:created") {
				documents = event.data.documents
			}
		},
	)

	await client.migrate(migration, { reporter })

	expect(reporter).toHaveBeenCalledWith({
		type: "documents:creating",
		data: {
			current: 1,
			remaining: 0,
			total: 1,
			document,
			documentParams: {
				documentTitle: "foo",
			},
		},
	})
	expect(documents?.get(document)?.id).toBe(newDocument.id)
})

it.concurrent(
	"creates new non-master locale document with direct reference",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const masterLanguageDocument = ctx.mock.value.document()
		const document = ctx.mock.value.document()
		const newDocument = {
			id: "foo",
			masterLanguageDocumentID: masterLanguageDocument.id,
		}

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [newDocument] })

		const migration = prismic.createMigration()

		migration.createDocument(document, "foo", { masterLanguageDocument })

		let documents: DocumentMap | undefined
		const reporter = vi.fn<(event: prismic.MigrateReporterEvents) => void>(
			(event) => {
				if (event.type === "documents:created") {
					documents = event.data.documents
				}
			},
		)

		await client.migrate(migration, { reporter })

		ctx.expect(reporter).toHaveBeenCalledWith({
			type: "documents:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				document,
				documentParams: {
					documentTitle: "foo",
					masterLanguageDocument,
				},
			},
		})
		ctx.expect(documents?.get(document)?.id).toBe(newDocument.id)
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
		const document = ctx.mock.value.document()
		const newDocument = {
			id: "foo",
			masterLanguageDocumentID: masterLanguageDocument.id,
		}

		mockPrismicRestAPIV2({ ctx, queryResponse })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [newDocument] })

		const migration = prismic.createMigration()

		migration.createDocument(document, "foo", {
			masterLanguageDocument: () => masterLanguageDocument,
		})

		let documents: DocumentMap | undefined
		const reporter = vi.fn<(event: prismic.MigrateReporterEvents) => void>(
			(event) => {
				if (event.type === "documents:created") {
					documents = event.data.documents
				}
			},
		)

		await client.migrate(migration, { reporter })

		ctx.expect(reporter).toHaveBeenCalledWith({
			type: "documents:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				document,
				documentParams: {
					documentTitle: "foo",
					masterLanguageDocument: expect.any(Function),
				},
			},
		})
		ctx.expect(documents?.get(document)?.id).toBe(newDocument.id)
		ctx.expect.assertions(3)
	},
)

it.concurrent(
	"creates new non-master locale document with lazy reference (new document)",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const masterLanguageDocument =
			ctx.mock.value.document() as prismic.PrismicMigrationDocument
		const document =
			ctx.mock.value.document() as prismic.PrismicMigrationDocument
		const newDocuments = [
			{
				id: masterLanguageDocument.id!,
			},
			{
				id: document.id!,
				masterLanguageDocumentID: masterLanguageDocument.id!,
			},
		]

		delete masterLanguageDocument.id
		delete document.id

		mockPrismicRestAPIV2({ ctx })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [...newDocuments] })

		const migration = prismic.createMigration()

		migration.createDocument(masterLanguageDocument, "foo")
		migration.createDocument(document, "bar", {
			masterLanguageDocument: () => masterLanguageDocument,
		})

		let documents: DocumentMap | undefined
		const reporter = vi.fn<(event: prismic.MigrateReporterEvents) => void>(
			(event) => {
				if (event.type === "documents:created") {
					documents = event.data.documents
				}
			},
		)

		await client.migrate(migration, { reporter })

		ctx
			.expect(documents?.get(masterLanguageDocument)?.id)
			.toBe(newDocuments[0].id)
		ctx.expect(documents?.get(document)?.id).toBe(newDocuments[1].id)
		ctx.expect.assertions(3)
	},
)

it.concurrent(
	"creates new non-master locale document with alternate language",
	async (ctx) => {
		const client = createTestWriteClient({ ctx })

		const { repository, masterLocale } = createRepository(ctx)
		const queryResponse = createPagedQueryResponses({
			ctx,
			pages: 1,
			pageSize: 1,
		})

		const masterLanguageDocument = queryResponse[0].results[0]
		masterLanguageDocument.lang = masterLocale
		const document = ctx.mock.value.document({
			alternateLanguages: [masterLanguageDocument],
		})
		const newDocument = {
			id: "foo",
			masterLanguageDocumentID: masterLanguageDocument.id,
		}

		mockPrismicRestAPIV2({ ctx, repositoryResponse: repository, queryResponse })
		mockPrismicAssetAPI({ ctx, client })
		mockPrismicMigrationAPI({ ctx, client, newDocuments: [newDocument] })

		const migration = prismic.createMigration()

		migration.createDocument(document, "foo")

		let documents: DocumentMap | undefined
		const reporter = vi.fn<(event: prismic.MigrateReporterEvents) => void>(
			(event) => {
				if (event.type === "documents:created") {
					documents = event.data.documents
				}
			},
		)

		await client.migrate(migration, { reporter })

		ctx.expect(reporter).toHaveBeenCalledWith({
			type: "documents:creating",
			data: {
				current: 1,
				remaining: 0,
				total: 1,
				document,
				documentParams: {
					documentTitle: "foo",
				},
			},
		})
		ctx.expect(documents?.get(document)?.id).toBe(newDocument.id)
		ctx.expect.assertions(3)
	},
)

it.concurrent("creates master locale documents first", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { repository, masterLocale } = createRepository(ctx)

	const masterLanguageDocument = ctx.mock.value.document()
	masterLanguageDocument.lang = masterLocale
	const document = ctx.mock.value.document()
	const newDocuments = [
		{
			id: masterLanguageDocument.id,
		},
		{
			id: document.id,
		},
	]

	mockPrismicRestAPIV2({ ctx, repositoryResponse: repository })
	mockPrismicAssetAPI({ ctx, client })
	mockPrismicMigrationAPI({ ctx, client, newDocuments: [...newDocuments] })

	const migration = prismic.createMigration()

	migration.createDocument(document, "bar")
	migration.createDocument(masterLanguageDocument, "foo")

	let documents: DocumentMap | undefined
	const reporter = vi.fn<(event: prismic.MigrateReporterEvents) => void>(
		(event) => {
			if (event.type === "documents:created") {
				documents = event.data.documents
			}
		},
	)

	await client.migrate(migration, { reporter })

	ctx
		.expect(documents?.get(masterLanguageDocument)?.id)
		.toBe(newDocuments[0].id)
	ctx.expect(documents?.get(document)?.id).toBe(newDocuments[1].id)
})
