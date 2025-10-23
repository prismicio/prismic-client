import { inject, test, vi } from "vitest"

import type {
	ContentApiDocument,
	ContentApiRef,
	ContentApiSearchResponse,
	RepositoryManager,
} from "@prismicio/e2e-tests-utils"

import { repos } from "./global.setup"

import type { Client } from "../src"
import { createClient } from "../src"

type Fixtures = {
	repo: RepositoryManager
	endpoint: string
	client: Client
	accessToken: string
	masterRef: string
	release: ContentApiRef
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
}

export const it = test.extend<Fixtures>({
	repo: async ({}, use) => {
		const name = inject("repo")
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
	response: async ({}, use) => {
		await use({
			repo: (masterRef) =>
				Response.json({
					refs: [
						{
							ref: masterRef,
							isMasterRef: true,
						},
					],
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
})
