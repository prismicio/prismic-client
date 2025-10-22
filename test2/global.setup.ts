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

	const mock = createMockFactory({ seed: "foo" })
	const model = mock.model.customType({
		id: "page",
		fields: { uid: mock.model.uid() },
	})
	await repo.createCustomTypes([model])

	const doc1 = await repo.createDocument(buildDocument({ model }), "published")
	const doc2 = await repo.createDocument(buildDocument({ model }), "published")
	const doc3 = await repo.createDocument(
		buildDocument({ model, locale: "fr-fr" }),
		"published",
	)
	const doc4 = await repo.createDocument(
		buildDocument({ model, locale: "fr-fr" }),
		"published",
	)

	const client = repo.getContentApiClient()
	const basic = await client.getDocumentByID(doc1.id)
	const another = await client.getDocumentByID(doc2.id)
	const french = await client.getDocumentByID(doc3.id, { lang: doc3.locale })
	const french2 = await client.getDocumentByID(doc4.id, { lang: doc4.locale })
	provide("docs", JSON.stringify({ basic, another, french, french2 }))
}

export async function teardown(): Promise<void> {
	await repos.tearDown()
}

function buildDocument(args: {
	model: { id: string }
	locale?: string
}): CoreApiDocumentCreationPayload {
	const { model, locale = "en-us" } = args

	return {
		custom_type_id: model.id,
		data: {
			uid: crypto.randomUUID(),
			uid_TYPE: "UID",
		},
		title: "",
		tags: [],
		locale,
		integration_field_ids: [],
	}
}
