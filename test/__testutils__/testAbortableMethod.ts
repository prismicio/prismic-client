import { it, expect } from "vitest";

import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";
import { createTestClient } from "./createClient";

import * as prismic from "../../src";

type TestAbortableMethodArgs = {
	run: (
		client: prismic.Client,
		signal: prismic.AbortSignalLike,
	) => Promise<unknown>;
};

export const testAbortableMethod = (
	description: string,
	args: TestAbortableMethodArgs,
) => {
	it.concurrent(description, async (ctx) => {
		const controller = new AbortController();
		controller.abort();

		mockPrismicRestAPIV2({ server: ctx.server });

		const client = createTestClient();

		await expect(async () => {
			await args.run(client, controller.signal);
		}).rejects.toThrow(/aborted/i);
	});
};
