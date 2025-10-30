import type { TestProject } from "vitest/node"

import { ok } from "node:assert"

import type { RepositoryManager } from "@prismicio/e2e-tests-utils"
import { createRepositoriesManager } from "@prismicio/e2e-tests-utils"
import type { CoreApiDocumentCreationPayload } from "@prismicio/e2e-tests-utils/dist/clients/coreApi"

import type { CustomType } from "@prismicio/types-internal/lib/customtypes"

try {
	process.loadEnvFile(".env.test.local")
} catch {}

ok(process.env.E2E_PRISMIC_EMAIL, "Missing E2E_PRISMIC_EMAIL")
ok(process.env.E2E_PRISMIC_PASSWORD, "Missing E2E_PRISMIC_PASSWORD")

export const repos = createRepositoriesManager({
	urlConfig: process.env.PRISMIC_WROOM_BASE_URL || "https://prismic.io",
	authConfig: {
		email: process.env.E2E_PRISMIC_EMAIL,
		password: process.env.E2E_PRISMIC_PASSWORD,
	},
})

export async function setup({ provide }: TestProject): Promise<void> {
	const repo = await repos.createRepository({
		prefix: "e2e-tests-prismicio-client",
		defaultLocale: "en-us",
		locales: ["en-us", "fr-fr"],
		customTypes: [],
		slices: [],
	})
	provide("repoName", repo.name)

	const repoMetadata = await repo.getContentApiClient().getAsJson("/api/v2")
	provide("repo", JSON.stringify(repoMetadata))

	const writeToken = await repos.getUserApiToken()
	provide("writeToken", writeToken)

	const accessToken = await repo.createContentAPIToken(
		"test",
		"master+releases",
	)
	provide("accessToken", accessToken)

	const model: CustomType = {
		id: "page",
		status: true,
		label: "Page",
		format: "page",
		repeatable: true,
		json: {
			Main: {
				uid: {
					type: "UID",
				},
				link: {
					type: "Link",
					config: { allowText: true },
				},
				var_link: {
					type: "Link",
					config: { variants: ["foo"] },
				},
				image: {
					type: "Image",
					config: { thumbnails: [{ name: "square" }] },
				},
				richtext: {
					type: "StructuredText",
					config: { multi: "paragraph,image,hyperlink" },
				},
			},
		},
	}
	const singleModel: CustomType = {
		id: "single",
		status: true,
		label: "Single",
		format: "custom",
		repeatable: false,
		json: { Main: {} },
	}
	await repo.createCustomTypes([model, singleModel])

	const routes = JSON.stringify([{ type: model.id, path: "/:uid" }])

	const default1 = await createDocument(repo, model.id, {
		tags: ["foo"],
		routes,
	})
	const default2 = await createDocument(repo, model.id, {
		tags: ["bar"],
		routes,
	})
	const default3 = await createDocument(repo, model.id, {
		tags: ["foo", "bar"],
		routes,
	})
	const default4 = await createDocument(repo, model.id, {
		tags: ["foo", "bar"],
		routes,
	})
	const defaultSingle = await createDocument(repo, singleModel.id, {
		routes,
	})
	const french1 = await createDocument(repo, model.id, {
		locale: "fr-fr",
		tags: ["foo"],
		routes,
	})
	const french2 = await createDocument(repo, model.id, {
		locale: "fr-fr",
		tags: ["bar"],
		routes,
	})
	const frenchSingle = await createDocument(repo, singleModel.id, {
		locale: "fr-fr",
		routes,
	})
	provide(
		"docs",
		JSON.stringify({
			default: default1,
			default2,
			default3,
			default4,
			defaultSingle,
			french: french1,
			french2,
			frenchSingle,
		}),
	)

	const client = repo.getContentApiClient({ accessToken })
	const releaseResult = await repo.createRelease("test")
	const refs = await client.getRefs()
	const release = refs.find((ref) => ref.id === releaseResult.id)!
	provide("release", JSON.stringify(release))
}

export async function teardown(): Promise<void> {
	await repos.tearDown()
}

export async function createDocument(
	repo: RepositoryManager,
	type: string,
	params: Partial<CoreApiDocumentCreationPayload> & { routes?: string } = {},
) {
	const { routes, ...doc } = params

	const docMeta = await repo.createDocument(
		{
			custom_type_id: type,
			title: "",
			tags: [],
			locale: "en-us",
			integration_field_ids: [],
			...doc,
			data: {
				uid: crypto.randomUUID(),
				uid_TYPE: "UID",
				...doc?.data,
			},
		},
		"published",
	)
	const publishedDoc = await repo
		.getContentApiClient()
		.getDocumentByID(docMeta.id, { lang: docMeta.locale, routes })
	if (!publishedDoc) {
		throw new Error("Document was not published")
	}

	return publishedDoc
}
