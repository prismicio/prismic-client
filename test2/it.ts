import { inject, test, vi } from "vitest"

import type {
	ContentApiDocument,
	ContentApiRef,
	ContentApiSearchResponse,
	CoreApiDocumentCreationPayload,
	RepositoryManager,
} from "@prismicio/e2e-tests-utils"

import { createDocument, repos } from "./global.setup"

import type { Client, Migration, WriteClient } from "../src"
import { createClient, createMigration, createWriteClient } from "../src"

export type Fixtures = {
	repo: RepositoryManager
	endpoint: string
	client: Client
	writeClient: WriteClient
	writeToken: string
	accessToken: string
	masterRef: string
	release: ContentApiRef
	migration: Migration
	response: {
		repo: (masterRef: string) => Response
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
}

export const it = test.extend<Fixtures>({
	repo: async ({}, use) => {
		const name = inject("repoName")
		const repo = repos.getRepositoryManager(name)
		await use(repo)
	},
	endpoint: async ({ repo }, use) => {
		const endpoint = new URL("api/v2/", repo.getBaseCdnURL()).toString()
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
	writeClient: async ({ repo, endpoint, writeToken }, use) => {
		const client = createWriteClient(repo.name, {
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
	masterRef: async ({ repo }, use) => {
		const masterRef = await repo.getContentApiClient().getMasterRef()
		await use(masterRef)
	},
	release: async ({}, use) => {
		const release = JSON.parse(inject("release"))
		await use(release)
	},
	migration: async ({}, use) => {
		const migration = createMigration()
		await use(migration)
	},
	response: async ({}, use) => {
		const { languages } = JSON.parse(inject("repo"))
		await use({
			repo: (masterRef) =>
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
	createDocument: async ({ repo }, use) => {
		await use(async (type, params) => {
			return createDocument(repo, type, params)
		})
	},
})
