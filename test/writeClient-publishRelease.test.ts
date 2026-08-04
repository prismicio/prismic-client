import { describe, vi } from "vitest"

import { version } from "../package.json"
import { ForbiddenError, NotFoundError, PrismicError } from "../src"
import { it } from "./it"

describe("publishMigrationRelease", () => {
	it("publishes the migration release and returns the total", async ({ expect, writeClient }) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ totalItems: 3 }, { status: 202 }),
		)

		const result = await writeClient.publishMigrationRelease()

		expect(result).toStrictEqual({ totalItems: 3 })
	})

	it("POSTs to the migration-release/publish endpoint", async ({ expect, writeClient }) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ totalItems: 0 }, { status: 202 }),
		)

		await writeClient.publishMigrationRelease()

		expect(writeClient.fetchFn).toHaveBeenCalledWith(
			new URL("migration-release/publish", writeClient.migrationAPIEndpoint).toString(),
			expect.objectContaining({ method: "POST" }),
		)
	})

	it("sends a body so the request is treated as a write (not deduplicated or unthrottled)", async ({
		expect,
		writeClient,
	}) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ totalItems: 0 }, { status: 202 }),
		)

		await writeClient.publishMigrationRelease()

		const init = vi.mocked(writeClient.fetchFn).mock.calls[0][1]
		expect(init?.body).toBeTruthy()
	})

	it("includes the required headers", async ({ expect, writeClient }) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ totalItems: 0 }, { status: 202 }),
		)

		await writeClient.publishMigrationRelease()

		expect(writeClient.fetchFn).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				headers: expect.objectContaining({
					"x-client": `prismicio-client/${version}`,
					repository: writeClient.repositoryName,
					authorization: `Bearer ${writeClient.writeToken}`,
				}),
			}),
		)
	})

	it("supports fetch options", async ({ expect, writeClient }) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ totalItems: 0 }, { status: 202 }),
		)

		await writeClient.publishMigrationRelease({
			fetchOptions: { headers: { foo: "bar" } },
		})

		expect(writeClient.fetchFn).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				headers: expect.objectContaining({ foo: "bar" }),
			}),
		)
	})

	it("supports signal", async ({ expect, writeClient }) => {
		await expect(() =>
			writeClient.publishMigrationRelease({ signal: AbortSignal.abort() }),
		).rejects.toThrow(/aborted/i)
	})

	it("throws a ForbiddenError on a 401 response", async ({ expect, writeClient }) => {
		vi.mocked(writeClient.fetchFn).mockResolvedValueOnce(
			Response.json({ message: "unauthorized" }, { status: 401 }),
		)

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
