import { expect, it } from "vitest"

import { createTestWriteClient } from "./__testutils__/createWriteClient"
import { mockPrismicMigrationAPI } from "./__testutils__/mockPrismicMigrationAPI"

import { ForbiddenError } from "../src"
import { UNKNOWN_RATE_LIMIT_DELAY } from "../src/BaseClient"

it.concurrent("creates a document", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const newDocument = { id: "foo" }

	mockPrismicMigrationAPI({ ctx, client, newDocuments: [newDocument] })

	// @ts-expect-error - testing purposes
	const { id } = await client.createDocument(
		{
			type: "type",
			uid: "uid",
			lang: "lang",
			data: {},
		},
		"Foo",
	)

	expect(id).toBe(newDocument.id)
})

it.concurrent("throws forbidden error on invalid credentials", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicMigrationAPI({ ctx, client, writeToken: "invalid" })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createDocument(
			{
				type: "type",
				uid: "uid",
				lang: "lang",
				data: {},
			},
			"Foo",
		),
	).rejects.toThrow(ForbiddenError)
})

// It seems like p-limit and node-fetch are not happy friends :/
// https://github.com/sindresorhus/p-limit/issues/64
it.skip("is abortable with an AbortController", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const controller = new AbortController()
	controller.abort()

	mockPrismicMigrationAPI({ ctx, client })

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createDocument(
			{
				type: "type",
				uid: "uid",
				lang: "lang",
				data: {},
			},
			"Foo",
			{ fetchOptions: { signal: controller.signal } },
		),
	).rejects.toThrow(/aborted/i)
})

it.concurrent("supports custom headers", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	const headers = { "x-custom": "foo" }
	const newDocument = { id: "foo" }

	mockPrismicMigrationAPI({
		ctx,
		client,
		requiredHeaders: headers,
		newDocuments: [newDocument],
	})

	// @ts-expect-error - testing purposes
	const { id } = await client.createDocument(
		{
			type: "type",
			uid: "uid",
			lang: "lang",
			data: {},
		},
		"Foo",
		{ fetchOptions: { headers } },
	)

	ctx.expect(id).toBe(newDocument.id)
	ctx.expect.assertions(2)
})

it.concurrent("respects unknown rate limit", async (ctx) => {
	const client = createTestWriteClient({ ctx })

	mockPrismicMigrationAPI({ ctx, client })

	const args = [
		{
			type: "type",
			uid: "uid",
			lang: "lang",
			data: {},
		},
		"Foo",
	]

	const start = Date.now()

	// @ts-expect-error - testing purposes
	await client.createDocument(...args)

	expect(Date.now() - start).toBeLessThan(UNKNOWN_RATE_LIMIT_DELAY)

	// @ts-expect-error - testing purposes
	await client.createDocument(...args)

	expect(Date.now() - start).toBeGreaterThanOrEqual(UNKNOWN_RATE_LIMIT_DELAY)
})

it("throws fetch errors as-is", async (ctx) => {
	const client = createTestWriteClient({
		ctx,
		clientConfig: {
			fetch: () => {
				throw new Error(ctx.task.name)
			},
		},
	})

	await expect(() =>
		// @ts-expect-error - testing purposes
		client.createDocument(
			{
				type: "type",
				uid: "uid",
				lang: "lang",
				data: {},
			},
			"Foo",
		),
	).rejects.toThrowError(ctx.task.name)
})
