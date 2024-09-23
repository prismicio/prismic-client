import { expect, it } from "vitest"

import { createTestClient } from "./createClient"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import type * as prismic from "../../src"

type TestAbortableMethodArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>
}

export const testAbortableMethod = (
	description: string,
	args: TestAbortableMethodArgs,
): void => {
	it.concurrent(description, async (ctx) => {
		const controller = new AbortController()
		controller.abort()

		mockPrismicRestAPIV2({ ctx })

		const client = createTestClient({ ctx })

		await expect(async () => {
			await args.run(client, {
				fetchOptions: {
					signal: controller.signal,
				},
			})
		}).rejects.toThrow(/aborted/i)
	})

	// TODO: Remove once the `signal` parameter is removed in favor of
	// `fetchOptions.signal`.
	it.concurrent(
		`${description} (using deprecated \`signal\` param)`,
		async (ctx) => {
			const controller = new AbortController()
			controller.abort()

			mockPrismicRestAPIV2({ ctx })

			const client = createTestClient({ ctx })

			await expect(async () => {
				await args.run(client, {
					signal: controller.signal,
				})
			}).rejects.toThrow(/aborted/i)
		},
	)
}
