import { inject, test, vi } from "vitest"

import type {
	AssetApiCreateResponse,
	ContentApiDocument,
	ContentApiRef,
	ContentApiSearchResponse,
	CoreApiDocumentCreationPayload,
	RepositoryManager,
} from "@prismicio/e2e-tests-utils"

import { createDocument, repositories } from "./setup.global"

import type { Client, Migration, WriteClient } from "../src"
import { createClient, createMigration, createWriteClient } from "../src"

export type Fixtures = {
	repository: RepositoryManager
	endpoint: string
	client: Client
	writeClient: WriteClient
	writeToken: string
	accessToken: string
	masterRef: string
	release: ContentApiRef
	migration: Migration
	response: {
		repository: (masterRef: string) => Response
		refNotFound: (newRef: string) => Response
		refExpired: (newRef: string) => Response
		search: (
			results: Partial<ContentApiDocument>[],
			payload?: Partial<Omit<ContentApiSearchResponse, "results">>,
		) => Response
	}
	docs: {
		default: ContentApiDocument & { uid: string }
		default2: ContentApiDocument & { uid: string }
		default3: ContentApiDocument & { uid: string }
		default4: ContentApiDocument & { uid: string }
		defaultSingle: ContentApiDocument & { uid: null }
		french: ContentApiDocument & { uid: string }
		french2: ContentApiDocument & { uid: string }
		frenchSingle: ContentApiDocument & { uid: null }
	}
	createDocument: (
		type: string,
		params?: Partial<CoreApiDocumentCreationPayload>,
	) => Promise<ContentApiDocument>
	getAsset: (
		params: { id: string; filename?: never } | { filename: string; id?: never },
	) => Promise<AssetApiCreateResponse>
}

export const it = test.extend<Fixtures>({
	repository: async ({}, use) => {
		const name = inject("repositoryName")
		const repository = repositories.getRepositoryManager(name)
		await use(repository)
	},
	endpoint: async ({ repository }, use) => {
		const endpoint = new URL("api/v2/", repository.getBaseCdnURL()).toString()
		await use(endpoint)
	},
	client: async ({ endpoint, docs }, use) => {
		const client = createClient(endpoint, {
			routes: [
				{ type: docs.default.type, path: "/:uid" },
				{ type: docs.defaultSingle.type, path: "/single" },
			],
		})
		vi.spyOn(client, "fetchFn")
		await use(client)
	},
	writeClient: async ({ repository, endpoint, writeToken }, use) => {
		const client = createWriteClient(repository.name, {
			documentAPIEndpoint: endpoint,
			writeToken: writeToken,
		})
		vi.spyOn(client, "fetchFn")
		await use(client)
	},
	writeToken: async ({}, use) => {
		const token = inject("writeToken")
		await use(token)
	},
	accessToken: async ({}, use) => {
		const token = inject("accessToken")
		await use(token)
	},
	masterRef: async ({ repository }, use) => {
		const masterRef = await repository.getContentApiClient().getMasterRef()
		await use(masterRef)
	},
	release: async ({ repository, accessToken }, use) => {
		const release = JSON.parse(inject("release"))
		const ref = await repository
			.getContentApiClient({ accessToken })
			.getRefByReleaseID(release.id)
		await use({ ...release, ref })
	},
	migration: async ({}, use) => {
		const migration = createMigration()
		await use(migration)
	},
	response: async ({}, use) => {
		const { languages } = JSON.parse(inject("repository"))
		await use({
			repository: (masterRef) =>
				Response.json({
					refs: [
						{
							ref: masterRef,
							isMasterRef: true,
						},
					],
					languages,
				}),
			refNotFound: (ref) =>
				Response.json(
					{
						type: "api_notfound_error",
						message: `Master ref is: ${ref}`,
					},
					{ status: 404 },
				),
			refExpired: (ref) =>
				Response.json(
					{
						message: `Master ref is: ${ref}`,
					},
					{ status: 410 },
				),
			search: (results, payload) =>
				Response.json({
					results,
					...payload,
				}),
		})
	},
	docs: async ({}, use) => {
		const docs = JSON.parse(inject("docs"))
		await use(docs)
	},
	createDocument: async ({ repository }, use) => {
		await use(async (type, params) => {
			return createDocument(repository, type, params)
		})
	},
	getAsset: async ({ expect, repository }, use) => {
		const assetAPIClient = repository.getAssetApiClient()
		await use(async (params) => {
			// Need to wait for new assets to be indexed.
			return await vi.waitFor(async () => {
				const assets = await assetAPIClient.search({ limit: 100 })
				const asset = assets.items.find((item) => {
					return params.filename
						? item.filename === params.filename
						: item.id === params.id
				})
				expect(asset).toBeDefined()

				return asset!
			}, 30000)
		})
	},
})
