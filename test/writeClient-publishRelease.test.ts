import type { CustomType } from "@prismicio/types-internal/lib/customtypes"
import { beforeAll, describe, inject, vi } from "vitest"

import {
	ForbiddenError,
	NotFoundError,
	PrismicError,
	createMigration,
	createWriteClient,
	type WriteClient,
} from "../src"
import { it } from "./it"
import { repositories } from "./setup.global"

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
		},
	},
}

// The Migration API is slow and has low rate limits.
vi.setConfig({ testTimeout: 20000 })

describe("publishMigrationRelease", () => {
	let isolatedWriteClient: WriteClient

	// Isolated repository so publishing the migration-release singleton cannot
	// race with concurrent migrate tests on the shared suite repository.
	beforeAll(async () => {
		const writeToken = inject("writeToken")
		const repository = await repositories.createRepository({
			prefix: "e2e-tests-prismicio-client-publish",
			defaultLocale: "en-us",
			locales: ["en-us"],
			customTypes: [model],
			slices: [],
		})
		isolatedWriteClient = createWriteClient(repository.name, { writeToken })
		vi.spyOn(isolatedWriteClient, "fetchFn")
	}, 60000)

	it("publishes the migration release and returns the total", async ({ expect }) => {
		const migration = createMigration()
		migration.createDocument(
			{
				type: model.id,
				lang: "en-us",
				uid: crypto.randomUUID(),
				data: {},
			},
			"title",
		)
		await isolatedWriteClient.migrate(migration)

		const result = await isolatedWriteClient.publishMigrationRelease()

		expect(result).toStrictEqual({ totalItems: 1 })
	})

	it("supports fetch options", async ({ expect }) => {
		await isolatedWriteClient.publishMigrationRelease({
			fetchOptions: { headers: { foo: "bar" } },
		})

		expect(isolatedWriteClient.fetchFn).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				headers: expect.objectContaining({
					foo: "bar",
				}),
			}),
		)
	})

	it("supports signal", async ({ expect, writeClient }) => {
		await expect(() =>
			writeClient.publishMigrationRelease({ signal: AbortSignal.abort() }),
		).rejects.toThrow(/aborted/i)
	})

	it("throws if using an invalid token", async ({ expect, writeClient }) => {
		writeClient.writeToken = "invalid"
		await expect(() => writeClient.publishMigrationRelease()).rejects.toThrow(ForbiddenError)
	})

	it("throws a NotFoundError on a 404 response", async ({ expect, writeClient }) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ message: "not found" }, { status: 404 }),
		)

		await expect(() => writeClient.publishMigrationRelease()).rejects.toThrow(NotFoundError)
	})

	it("throws a PrismicError on a 500 response", async ({ expect, writeClient }) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ message: "server error" }, { status: 500 }),
		)

		await expect(() => writeClient.publishMigrationRelease()).rejects.toThrow(PrismicError)
	})
})
