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
		basic: ContentApiDocument & { uid: string }
		another: ContentApiDocument & { uid: string }
		french: ContentApiDocument & { uid: string }
		french2: ContentApiDocument & { uid: string }
	}
}

export const it = test.extend<Fixtures>({
	repo: async ({}, use) => {
		const name = inject("repo")
		const repo = repos.getRepositoryManager(name)
		await use(repo)
	},
	client: async ({ repo }, use) => {
		const endpoint = new URL("api/v2/", repo.getBaseCdnURL())
		const client = createClient(endpoint.toString())
		vi.spyOn(client, "fetchFn")
		await use(client)
	},
	accessToken: async ({ task, repo }, use) => {
		const token = await repo.createContentAPIToken(task.id, "master+releases")
		await use(token)
	},
	masterRef: async ({ repo }, use) => {
		const masterRef = await repo.getContentApiClient().getMasterRef()
		await use(masterRef)
	},
	release: async ({ task, repo, accessToken }, use) => {
		const { id } = await repo.createRelease(task.id)
		const refs = await repo.getContentApiClient({ accessToken }).getRefs()
		const release = refs.find((ref) => ref.id === id)!
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
