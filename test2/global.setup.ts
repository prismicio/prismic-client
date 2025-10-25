import type { TestProject } from "vitest/node"

import { ok } from "node:assert"

import { createRepositoriesManager } from "@prismicio/e2e-tests-utils"
import type { CoreApiDocumentCreationPayload } from "@prismicio/e2e-tests-utils/dist/clients/coreApi"
import { createMockFactory } from "@prismicio/mock"

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
	provide("repo", repo.name)

	const accessToken = await repo.createContentAPIToken(
		"test",
		"master+releases",
	)
	provide("accessToken", accessToken)

	const client = repo.getContentApiClient({ accessToken })

	const mock = createMockFactory({ seed: "foo" })
	const model = mock.model.customType({
		id: "page",
		fields: { uid: mock.model.uid() },
	})
	const singleModel = mock.model.customType({
		id: "single",
		repeatable: false,
	})
	await repo.createCustomTypes([model, singleModel])

	const default1Meta = await repo.createDocument(
		buildDocument(model, { tags: ["foo"] }),
		"published",
	)
	const default2Meta = await repo.createDocument(
		buildDocument(model, { tags: ["bar"] }),
		"published",
	)
	const default3Meta = await repo.createDocument(
		buildDocument(model, { tags: ["foo", "bar"] }),
		"published",
	)
	const default4Meta = await repo.createDocument(
		buildDocument(model, { tags: ["foo", "bar"] }),
		"published",
	)
	const defaultSingleMeta = await repo.createDocument(
		buildDocument(singleModel),
		"published",
	)
	const french1Meta = await repo.createDocument(
		buildDocument(model, { locale: "fr-fr", tags: ["foo"] }),
		"published",
	)
	const french2Meta = await repo.createDocument(
		buildDocument(model, { locale: "fr-fr", tags: ["bar"] }),
		"published",
	)
	const frenchSingleMeta = await repo.createDocument(
		buildDocument(singleModel, { locale: "fr-fr" }),
		"published",
	)

	const routes = JSON.stringify([{ type: model.id, path: "/:uid" }])

	const default1 = await client.getDocumentByID(default1Meta.id, { routes })
	const default2 = await client.getDocumentByID(default2Meta.id, { routes })
	const default3 = await client.getDocumentByID(default3Meta.id, { routes })
	const default4 = await client.getDocumentByID(default4Meta.id, { routes })
	const defaultSingle = await client.getDocumentByID(defaultSingleMeta.id, {
		routes,
	})
	const french1 = await client.getDocumentByID(french1Meta.id, {
		lang: french1Meta.locale,
		routes,
	})
	const french2 = await client.getDocumentByID(french2Meta.id, {
		lang: french2Meta.locale,
		routes,
	})
	const frenchSingle = await client.getDocumentByID(frenchSingleMeta.id, {
		lang: frenchSingleMeta.locale,
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

	const releaseResult = await repo.createRelease("test")
	const refs = await client.getRefs()
	const release = refs.find((ref) => ref.id === releaseResult.id)!
	provide("release", JSON.stringify(release))
}

export async function teardown(): Promise<void> {
	await repos.tearDown()
}

function buildDocument(
	model: { id: string },
	doc?: Partial<CoreApiDocumentCreationPayload>,
): CoreApiDocumentCreationPayload {
	return {
		custom_type_id: model.id,
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
	}
}
