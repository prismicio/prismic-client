import type { TestProject } from "vitest/node"

import { ok } from "node:assert"
import { setTimeout as wait } from "node:timers/promises"

import type {
	ContentApiDocument,
	CoreApiDocumentCreationPayload,
	RepositoryManager,
} from "@prismicio/e2e-tests-utils"
import { createRepositoriesManager } from "@prismicio/e2e-tests-utils"

import type { CustomType } from "@prismicio/types-internal/lib/customtypes"

try {
	process.loadEnvFile(".env.test.local")
} catch {}

ok(
	process.env.E2E_PRISMIC_EMAIL,
	"Missing E2E_PRISMIC_EMAIL. See the .env.test.example file.",
)
ok(
	process.env.E2E_PRISMIC_PASSWORD,
	"Missing E2E_PRISMIC_PASSWORD. See the .env.test.example file.",
)

export const repositories = createRepositoriesManager({
	urlConfig: process.env.PRISMIC_WROOM_BASE_URL || "https://prismic.io",
	authConfig: {
		email: process.env.E2E_PRISMIC_EMAIL,
		password: process.env.E2E_PRISMIC_PASSWORD,
	},
})

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
const routes = JSON.stringify([{ type: model.id, path: "/:uid" }])

export async function setup({ provide }: TestProject): Promise<void> {
	const repository = await repositories.createRepository({
		prefix: "e2e-tests-prismicio-client",
		defaultLocale: "en-us",
		locales: ["en-us", "fr-fr"],
		customTypes: [model, singleModel],
		slices: [],
	})
	provide("repositoryName", repository.name)

	const [
		repositoryMeta,
		writeToken,
		accessToken,
		initRelease,
		testReleaseMeta,
	] = await Promise.all([
		repository.getContentApiClient().getAsJson("/api/v2"),
		repositories.getUserApiToken(),
		repository.createContentAPIToken("test", "master+releases"),
		repository.createRelease("init"),
		repository.createRelease("test"),
	])
	provide("repository", JSON.stringify(repositoryMeta))
	provide("writeToken", writeToken)
	provide("accessToken", accessToken)

	const doc = {
		accessToken,
		routes,
		release_id: initRelease.id,
		status: "draft",
	} as const
	const [
		default1,
		default2,
		default3,
		default4,
		defaultSingle,
		french1,
		french2,
		frenchSingle,
	] = await Promise.all([
		createDocument(repository, model.id, { ...doc, tags: ["foo"] }),
		createDocument(repository, model.id, { ...doc, tags: ["bar"] }),
		createDocument(repository, model.id, { ...doc, tags: ["foo", "bar"] }),
		createDocument(repository, model.id, { ...doc, tags: ["foo", "bar"] }),
		createDocument(repository, singleModel.id, { ...doc }),
		createDocument(repository, model.id, {
			...doc,
			locale: "fr-fr",
			tags: ["foo"],
		}),
		createDocument(repository, model.id, {
			...doc,
			locale: "fr-fr",
			tags: ["bar"],
		}),
		createDocument(repository, singleModel.id, { ...doc, locale: "fr-fr" }),
	])
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

	await repository.publishRelease(initRelease.id)

	const client = repository.getContentApiClient({ accessToken })
	const refs = await client.getRefs()
	const release = refs.find((ref) => ref.id === testReleaseMeta.id)!
	provide("release", JSON.stringify(release))
}

export async function teardown(): Promise<void> {
	await repositories.tearDown()
}

export async function createDocument(
	repository: RepositoryManager,
	type: string,
	params: Partial<CoreApiDocumentCreationPayload> & {
		accessToken?: string
		routes?: string
		status?: "published" | "draft"
	} = {},
): Promise<ContentApiDocument> {
	const {
		accessToken,
		routes,
		status = "published",
		release_id,
		...doc
	} = params

	const docMeta = await repository.createDocument(
		{
			custom_type_id: type,
			title: "",
			tags: [],
			locale: "en-us",
			integration_field_ids: [],
			release_id,
			...doc,
			data: {
				uid: crypto.randomUUID(),
				uid_TYPE: "UID",
				...doc?.data,
			},
		},
		status,
	)
	const client = repository.getContentApiClient({ accessToken })

	return await waitFor(async () => {
		const ref = release_id
			? await client.getRefByReleaseID(release_id)
			: undefined
		const publishedDoc = await client.getDocumentByID(docMeta.id, {
			ref,
			lang: docMeta.locale,
			routes,
		})
		ok(publishedDoc, `Failed to find document ${docMeta.id} in the Content API`)

		return publishedDoc
	})
}

async function waitFor<T>(
	fn: () => T | Promise<T>,
	config: { timeout?: number; interval?: number } = {},
): Promise<T> {
	const { timeout = 3000, interval = 1000 } = config

	let error: unknown

	const timer = setTimeout(() => {
		throw error
	}, timeout)

	while (true) {
		try {
			const res = await fn()
			clearTimeout(timer)

			return res
		} catch (e) {
			error = e
			await wait(interval)
		}
	}
}
