import { it, expect } from "vitest";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";
import { createTestClient } from "./createClient";

import * as prismic from "../../src";

type TestAbortableMethodArgs = {
	run: (client: prismic.Client, signal: AbortSignal) => Promise<unknown>;
	server: mswNode.SetupServerApi;
};

export const testAbortableMethod = (
	description: string,
	args: TestAbortableMethodArgs,
) => {
	it.concurrent(description, async () => {
		const controller = new AbortController();
		controller.abort();

		mockPrismicRestAPIV2({ server: args.server });

		const client = createTestClient();

		await expect(async () => {
			await args.run(client, controller.signal);
		}).rejects.toThrow(/aborted/i);
	});
};
