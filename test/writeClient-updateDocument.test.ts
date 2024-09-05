import { expect, it } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicMigrationAPI } from "./__testutils__/mockPrismicMigrationAPI"

import { ForbiddenError, NotFoundError } from "../src"
import { UNKNOWN_RATE_LIMIT_DELAY } from "../src/BaseClient"

it.concurrent("updates a document", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { documentsDatabase } = mockPrismicMigrationAPI({
		ctx,
		client,
		existingDocuments: 1,
	})

	const document = Object.values(documentsDatabase)[0]

	await expect(
		// @ts-expect-error - testing purposes
		client.updateDocument(document.id, {
			uid: "uid",
			data: {},
		}),
	).resolves.toBeUndefined()
})

it.concurrent("throws not found error on not found ID", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicMigrationAPI({ ctx, client })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.updateDocument("foo", {
			uid: "uid",
			data: {},
		}),
	).rejects.toThrow(NotFoundError)
})

it.concurrent("respects unknown rate limit", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const { documentsDatabase } = mockPrismicMigrationAPI({
		ctx,
		client,
		existingDocuments: 1,
	})

	const document = Object.values(documentsDatabase)[0]

	const args = [
		document.id,
		{
			uid: "uid",
			data: {},
		},
	]

	const start = Date.now()

	// @ts-expect-error - testing purposes
	await client.updateDocument(...args)

	expect(Date.now() - start).toBeLessThan(UNKNOWN_RATE_LIMIT_DELAY)

	// @ts-expect-error - testing purposes
	await client.updateDocument(...args)

	expect(Date.now() - start).toBeGreaterThanOrEqual(UNKNOWN_RATE_LIMIT_DELAY)
})

it.concurrent("throws forbidden error on invalid credentials", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicMigrationAPI({ ctx, client, writeToken: "invalid" })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.updateDocument("foo", {
			uid: "uid",
			data: {},
		}),
	).rejects.toThrow(ForbiddenError)
})

// It seems like p-limit and node-fetch are not happy friends :/
// https://github.com/sindresorhus/p-limit/issues/64
it.skip("supports abort controller", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const controller = new AbortController()
	controller.abort()

	const { documentsDatabase } = mockPrismicMigrationAPI({
		ctx,
		client,
		existingDocuments: 1,
	})

	const document = Object.values(documentsDatabase)[0]

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.updateDocument(
			document.id,
			{
				uid: "uid",
				data: {},
			},
			{ fetchOptions: { signal: controller.signal } },
		),
	).rejects.toThrow(/aborted/i)
})
