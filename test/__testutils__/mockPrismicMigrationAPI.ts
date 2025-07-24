import type { TestContext } from "vitest"

import type { RestRequest } from "msw"
import { rest } from "msw"

import type { PrismicDocument, WriteClient } from "../../src"
import type {
	PostDocumentParams,
	PostDocumentResult,
	PutDocumentParams,
	PutDocumentResult,
} from "../../src/types/api/migration/document"

type MockPrismicMigrationAPIArgs = {
	ctx: TestContext
	client: WriteClient
	writeToken?: string
	migrationAPIKey?: string
	requiredHeaders?: Record<string, string>
	existingDocuments?: (PostDocumentResult | PrismicDocument)[] | number
	newDocuments?: { id: string; masterLanguageDocumentID?: string }[]
}

type MockPrismicMigrationAPIReturnType = {
	documentsDatabase: Record<
		string,
		PostDocumentResult & Pick<PrismicDocument, "data">
	>
}

export const mockPrismicMigrationAPI = (
	args: MockPrismicMigrationAPIArgs,
): MockPrismicMigrationAPIReturnType => {
	const repositoryName = args.client.repositoryName
	const migrationAPIEndpoint = args.client.migrationAPIEndpoint
	const writeToken = args.writeToken || args.client.writeToken
	const migrationAPIKey = args.migrationAPIKey || args.client.migrationAPIKey

	const documentsDatabase: Record<
		string,
		PostDocumentResult & Pick<PrismicDocument, "data">
	> = {}

	const validateHeaders = (req: RestRequest) => {
		if (args.requiredHeaders) {
			for (const name in args.requiredHeaders) {
				const requiredValue = args.requiredHeaders[name]

				args.ctx.expect(req.headers.get(name)).toBe(requiredValue)
			}
		}
	}

	if (args.existingDocuments) {
		if (typeof args.existingDocuments === "number") {
			for (let i = 0; i < args.existingDocuments; i++) {
				const document = args.ctx.mock.value.document()
				documentsDatabase[document.id] = {
					title: args.ctx.mock.value.keyText({ state: "filled" }),
					id: document.id,
					lang: document.lang,
					type: document.type,
					uid: document.uid,
					data: document.data,
				}
			}
		} else {
			for (const document of args.existingDocuments) {
				if ("title" in document) {
					documentsDatabase[document.id] = { ...document, data: {} }
				} else {
					documentsDatabase[document.id] = {
						title: args.ctx.mock.value.keyText({ state: "filled" }),
						id: document.id,
						lang: document.lang,
						type: document.type,
						uid: document.uid,
						data: document.data,
					}
				}
			}
		}
	}

	args.ctx.server.use(
		rest.post(
			new URL("documents", migrationAPIEndpoint).toString(),
			async (req, res, ctx) => {
				if (
					req.headers.get("authorization") !== `Bearer ${writeToken}` ||
					req.headers.get("x-api-key") !== migrationAPIKey ||
					req.headers.get("repository") !== repositoryName
				) {
					return res(ctx.status(403), ctx.json({ Message: "forbidden" }))
				}

				validateHeaders(req)

				const body = await req.json<PostDocumentParams>()

				// New document is used when we need to have predictable document ID
				// It's also used when we need to test for correct `alternate_language_id`
				// because the API doesn't return it in the response.
				const newDocument = args.newDocuments?.shift()
				const id = newDocument?.id || args.ctx.mock.value.document().id

				if (newDocument?.masterLanguageDocumentID) {
					args.ctx
						.expect(body.alternate_language_id)
						.toBe(newDocument.masterLanguageDocumentID)
				}

				const response: PostDocumentResult = {
					title: body.title,
					id,
					lang: body.lang,
					type: body.type,
					uid: body.uid,
				}

				// Save the document in DB
				documentsDatabase[id] = { ...response, data: body.data }

				return res(ctx.status(201), ctx.json(response))
			},
		),
		rest.put(
			new URL("documents/:id", migrationAPIEndpoint).toString(),
			async (req, res, ctx) => {
				if (
					req.headers.get("authorization") !== `Bearer ${writeToken}` ||
					req.headers.get("x-api-key") !== migrationAPIKey ||
					req.headers.get("repository") !== repositoryName
				) {
					return res(ctx.status(403), ctx.json({ Message: "forbidden" }))
				}

				validateHeaders(req)

				const document = documentsDatabase[req.params.id as string]

				if (!document) {
					return res(ctx.status(404))
				}

				const body = await req.json<PutDocumentParams>()

				const response: PutDocumentResult = {
					title: body.title || document.title,
					id: req.params.id as string,
					lang: document.lang,
					type: document.type,
					uid: body.uid,
				}

				// Update the document in DB
				documentsDatabase[req.params.id as string] = {
					...response,
					data: body.data,
				}

				return res(ctx.json(response))
			},
		),
	)

	return { documentsDatabase }
}
