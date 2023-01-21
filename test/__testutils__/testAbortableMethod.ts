import { expect, it } from "vitest";

import { createTestClient } from "./createClient";
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";

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

		mockPrismicRestAPIV2({ ctx });

		const client = createTestClient();

		await expect(async () => {
			await args.run(client, controller.signal);
		}).rejects.toThrow(/aborted/i);
	});
};
