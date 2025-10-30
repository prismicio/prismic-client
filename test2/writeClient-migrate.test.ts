import { describe, vi } from "vitest"

import { version } from "../package.json"

import { it } from "./it"

import { ForbiddenError, NotFoundError } from "../src"

// The Migration API is slow and has low rate limits.
vi.setConfig({ testTimeout: 20000 })

describe("documents", () => {
	it("creates documents in the migration release", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
	}) => {
		const doc = migration.createDocument(
			{
				type: docs.default.type,
				lang: docs.default.lang,
				uid: crypto.randomUUID(),
				data: {},
			},
			"title",
		)
		await writeClient.migrate(migration)
		const release = await repo.getMigrationRelease()
		expect(release).toContainDocumentWithUID(
			docs.default.type,
			doc.document.uid,
		)
	})

	it("updates documents in the migration release", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
	}) => {
		const doc = migration.updateDocument({
			...docs.default,
			uid: crypto.randomUUID(),
		})
		await writeClient.migrate(migration)
		const release = await repo.getMigrationRelease()
		expect(release).toContainDocumentWithUID(
			docs.default.type,
			doc.document.uid,
		)
	})

	it("supports lang", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
	}) => {
		const doc = migration.updateDocument({
			...docs.french,
			uid: crypto.randomUUID(),
		})
		await writeClient.migrate(migration)
		const release = await repo.getMigrationRelease({
			language: docs.french.lang,
		})
		expect(release).toContainDocumentWithUID(
			docs.default.type,
			doc.document.uid,
		)
	})

	it("supports alternate lang", async ({
		expect,
		writeClient,
		migration,
		docs,
		repo,
		createDocument,
	}) => {
		const baseDoc = await createDocument(docs.default.type)
		const doc = migration.createDocument(
			{
				uid: crypto.randomUUID(),
				type: baseDoc.type,
				lang: docs.french.lang,
				data: {},
			},
			"title",
			{ masterLanguageDocument: baseDoc },
		)
		await writeClient.migrate(migration)
		const release = await repo.getMigrationRelease({
			language: docs.french.lang,
		})
		const releaseDoc = release.results.find(
			(result) => result.id === doc.document.id,
		)!
		const localizedDocs = await repo.getDocuments({
			groupLangIds: [releaseDoc.group_lang_id],
		})
		expect(localizedDocs).toContainDocument(baseDoc.id)
		expect(localizedDocs).toContainDocument(doc.document.id!)
	})

	it("throws when an updated document does not exist", async ({
		expect,
		writeClient,
		migration,
		docs,
	}) => {
		migration.updateDocument({ ...docs.default, id: "foo" })
		await expect(() => writeClient.migrate(migration)).rejects.toThrow(
			NotFoundError,
		)
	})
})

describe.concurrent("assets", () => {
	it("supports File", async ({ expect, writeClient, migration, getAsset }) => {
		const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/>"
		const file = new File([new TextEncoder().encode(svg)], crypto.randomUUID())
		migration.createAsset(file, file.name)
		await writeClient.migrate(migration)
		const asset = await getAsset({ filename: file.name })
		expect(asset.filename).toBe(file.name)
	})

	it("supports URL", async ({ expect, writeClient, migration, getAsset }) => {
		const url = new URL(
			"https://images.prismic.io/prismic-main/a1307082-512a-4088-bace-30cdae70148e_stairs.jpg?w=100",
		)
		const filename = crypto.randomUUID()
		migration.createAsset(url, filename)
		await writeClient.migrate(migration)
		const asset = await getAsset({ filename })
		expect(asset.filename).toBe(filename)
	})

	it("supports url string", async ({
		expect,
		writeClient,
		migration,
		getAsset,
	}) => {
		const url =
			"https://images.prismic.io/prismic-main/a1307082-512a-4088-bace-30cdae70148e_stairs.jpg?w=100"
		const filename = crypto.randomUUID()
		migration.createAsset(url, filename)
		await writeClient.migrate(migration)
		const asset = await getAsset({ filename })
		expect(asset.filename).toBe(filename)
	})

	it("supports params", async ({
		expect,
		writeClient,
		migration,
		getAsset,
	}) => {
		const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/>"
		const file = new File([new TextEncoder().encode(svg)], crypto.randomUUID())
		migration.createAsset(file, file.name, {
			alt: "alt",
			credits: "credits",
			notes: "notes",
			tags: ["tag"],
		})
		await writeClient.migrate(migration)
		const asset = await getAsset({ filename: file.name })
		expect(asset).toMatchObject({
			filename: file.name,
			alt: "alt",
			credits: "credits",
			notes: "notes",
			tags: expect.arrayContaining([expect.objectContaining({ name: "tag" })]),
		})
	})

	it("throws when a url cannot be fetched", async ({
		expect,
		writeClient,
		migration,
	}) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			new Response(null, { status: 429 }),
		)
		migration.createAsset(
			"https://images.prismic.io/prismic-main/a1307082-512a-4088-bace-30cdae70148e_stairs.jpg?w=100",
			"filename",
		)
		await expect(() => writeClient.migrate(migration)).rejects.toThrow(
			/could not fetch foreign asset/i,
		)
	})
})

it("supports a reporter", async ({ expect, writeClient, migration, docs }) => {
	const reporter = vi.fn()
	const newDoc = migration.createDocument(
		{
			uid: crypto.randomUUID(),
			type: docs.default.type,
			lang: docs.default.lang,
			data: {},
		},
		"title",
	)
	const existingDoc = migration.updateDocument(docs.default)
	const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/>"
	const file = new File([new TextEncoder().encode(svg)], crypto.randomUUID())
	const asset = migration.createAsset(file, file.name)
	await writeClient.migrate(migration, { reporter })
	expect(reporter).toHaveBeenNthCalledWith(1, {
		type: "start",
		data: {
			pending: {
				documents: 2,
				assets: 1,
			},
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(2, {
		type: "assets:creating",
		data: {
			asset,
			current: 1,
			remaining: 0,
			total: 1,
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(3, {
		type: "assets:created",
		data: {
			created: 1,
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(4, {
		type: "documents:masterLocale",
		data: {
			masterLocale: "en-us",
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(5, {
		type: "documents:creating",
		data: {
			document: newDoc,
			current: 1,
			remaining: 0,
			total: 1,
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(6, {
		type: "documents:created",
		data: {
			created: 1,
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(7, {
		type: "documents:updating",
		data: {
			document: newDoc,
			current: 1,
			remaining: 1,
			total: 2,
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(8, {
		type: "documents:updating",
		data: {
			document: existingDoc,
			current: 2,
			remaining: 0,
			total: 2,
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(9, {
		type: "documents:updated",
		data: {
			updated: 2,
		},
	})
	expect(reporter).toHaveBeenNthCalledWith(10, {
		type: "end",
		data: {
			migrated: {
				documents: 2,
				assets: 1,
			},
		},
	})
	vi.useRealTimers()
})

it.concurrent(
	"includes x-client version header",
	async ({ expect, writeClient, migration, docs }) => {
		migration.updateDocument(docs.default2)
		await writeClient.migrate(migration)
		expect(writeClient.fetchFn).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				headers: expect.objectContaining({
					"x-client": `prismicio-client/${version}`,
				}),
			}),
		)
	},
)

it("throws if using an invalid token", async ({
	expect,
	writeClient,
	migration,
	docs,
}) => {
	writeClient.writeToken = "invalid"
	migration.updateDocument(docs.default2)
	await expect(() => writeClient.migrate(migration)).rejects.toThrow(
		ForbiddenError,
	)
})

it("supports fetch options", async ({
	expect,
	writeClient,
	migration,
	docs,
}) => {
	migration.updateDocument(docs.default)
	await writeClient.migrate(migration, {
		fetchOptions: { headers: { foo: "bar" } },
	})
	expect(writeClient.fetchFn).toHaveBeenCalledWith(
		expect.anything(),
		expect.objectContaining({
			headers: expect.objectContaining({
				foo: "bar",
			}),
		}),
	)
})

it("supports signal", async ({ expect, writeClient, migration, docs }) => {
	migration.updateDocument(docs.default)
	await expect(() =>
		writeClient.migrate(migration, { signal: AbortSignal.abort() }),
	).rejects.toThrow(/aborted/i)
})
