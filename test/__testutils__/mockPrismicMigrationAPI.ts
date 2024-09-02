import type { TestContext } from "vitest"

import { rest } from "msw"

import { createRepositoryName } from "./createRepositoryName"

import type {
	PostDocumentParams,
	PostDocumentResult,
	PutDocumentParams,
	PutDocumentResult,
} from "../../src/types/api/migration/document"

type MockPrismicMigrationAPIV2Args = {
	ctx: TestContext
	writeToken: string
	migrationAPIKey: string
	expectedID?: string
}

export const mockPrismicRestAPIV2 = (
	args: MockPrismicMigrationAPIV2Args,
): void => {
	const repositoryName = createRepositoryName()
	const migrationAPIEndpoint = `https://migration.prismic.io`

	args.ctx.server.use(
		rest.post(`${migrationAPIEndpoint}/documents`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${args.writeToken}` ||
				req.headers.get("x-apy-key") !== args.migrationAPIKey ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401))
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
	)

	args.ctx.server.use(
		rest.put(`${migrationAPIEndpoint}/documents/:id`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${args.writeToken}` ||
				req.headers.get("x-apy-key") !== args.migrationAPIKey ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401))
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
