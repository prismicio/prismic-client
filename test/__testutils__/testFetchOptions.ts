import { expect, it, vi } from "vitest";

import fetch from "node-fetch";

import { createTestClient } from "./createClient";
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";

import * as prismic from "../../src";

type TestFetchOptionsArgs = {
	run: (
		client: prismic.Client,
		params?: Parameters<prismic.Client["get"]>[0],
	) => Promise<unknown>;
};

export const testFetchOptions = (
	description: string,
	args: TestFetchOptionsArgs,
): void => {
	it.concurrent(`${description} (on client)`, async (ctx) => {
		const abortController = new AbortController();

		const fetchSpy = vi.fn(fetch);
		const fetchOptions: prismic.RequestInitLike = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		};

		mockPrismicRestAPIV2({
			ctx,
			queryResponse: ctx.mock.api.query({
				documents: [ctx.mock.value.document()],
			}),
		});

		const client = createTestClient({
			clientConfig: {
				fetch: fetchSpy,
				fetchOptions,
			},
		});

		await args.run(client);

		for (const [input, init] of fetchSpy.mock.calls) {
			expect(init, input.toString()).toStrictEqual(fetchOptions);
		}
	});

	it.concurrent(`${description} (on method)`, async (ctx) => {
		const abortController = new AbortController();

		const fetchSpy = vi.fn(fetch);
		const fetchOptions: prismic.RequestInitLike = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		};

		mockPrismicRestAPIV2({
			ctx,
			queryResponse: ctx.mock.api.query({
				documents: [ctx.mock.value.document()],
			}),
		});

		const client = createTestClient({
			clientConfig: {
				fetch: fetchSpy,
			},
		});

		await args.run(client, { fetchOptions });

		for (const [input, init] of fetchSpy.mock.calls) {
			expect(init, input.toString()).toStrictEqual(fetchOptions);
		}
	});
};
