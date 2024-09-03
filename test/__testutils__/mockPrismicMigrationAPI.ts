import type { TestContext } from "vitest"

import { rest } from "msw"

import type { WriteClient } from "../../src"
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
	expectedID?: string
}

export const mockPrismicMigrationAPI = (
	args: MockPrismicMigrationAPIArgs,
): void => {
	const repositoryName = args.client.repositoryName
	const migrationAPIEndpoint = args.client.migrationAPIEndpoint
	const writeToken = args.writeToken || args.client.writeToken
	const migrationAPIKey = args.migrationAPIKey || args.client.migrationAPIKey

	args.ctx.server.use(
		rest.post(`${migrationAPIEndpoint}documents`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${writeToken}` ||
				req.headers.get("x-api-key") !== migrationAPIKey ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(403), ctx.json({ Message: "forbidden" }))
			}

			const id = args.expectedID || args.ctx.mock.value.document().id
			const body = await req.json<PostDocumentParams>()

			const response: PostDocumentResult = {
				title: body.title,
				id,
				lang: body.lang,
				type: body.type,
				uid: body.uid,
			}

			return res(ctx.status(201), ctx.json(response))
		}),
		rest.put(`${migrationAPIEndpoint}documents/:id`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${writeToken}` ||
				req.headers.get("x-api-key") !== migrationAPIKey ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(403), ctx.json({ Message: "forbidden" }))
			}

			if (req.params.id !== args.expectedID) {
				return res(ctx.status(404))
			}

			const document = args.ctx.mock.value.document()
			const id = args.expectedID || document.id
			const body = await req.json<PutDocumentParams>()

			const response: PutDocumentResult = {
				title: body.title || args.ctx.mock.value.keyText({ state: "filled" }),
				id,
				lang: document.lang,
				type: document.type,
				uid: body.uid,
			}

			return res(ctx.json(response))
		}),
	)
}
