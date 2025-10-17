import { ok } from "node:assert"

import { createRepositoriesManager } from "@prismicio/e2e-tests-utils"

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

export async function setup() {
	const repo = await repos.createRepository({
		prefix: "e2e-tests-prismicio-client",
		defaultLocale: "en-us",
		locales: ["en-us", "fr-fr"],
		customTypes: [],
		slices: [],
	})
	process.env.PRISMIC_REPO_NAME = repo.name
}

export async function teardown() {
	await repos.tearDown()
}
