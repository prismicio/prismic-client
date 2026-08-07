import { vi } from "vitest"

import { ForbiddenError, NotFoundError, PrismicError } from "../src"
import { it } from "./it"
import { model } from "./setup.global"

// The Migration API is slow and has low rate limits.
vi.setConfig({ testTimeout: 20000 })

it("publishes the migration release and returns the total", async ({
	expect,
	isolatedWriteClient,
	migration,
}) => {
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

it("supports fetch options", async ({ expect, isolatedWriteClient, migration }) => {
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
