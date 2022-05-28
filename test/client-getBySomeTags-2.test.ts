import { test, expect, afterAll, beforeAll } from "vitest";
import * as mswNode from "msw/node";
import * as prismicM from "@prismicio/mock";
import AbortController from "abort-controller";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

test("queries for documents by some tags", async () => {
	const seed = expect.getState().currentTestName;

	const tags = ["foo", "bar"];
	const queryResponse = prismicM.api.query({ seed });

	mockPrismicRestAPIV2({
		server,
		queryResponse,
		queryRequiredParams: {
			q: `[[any(document.tags, [${tags
				.map((tag) => `"${tag}"`)
				.join(", ")}])]]`,
		},
	});

	const client = createTestClient();
	const res = await client.getBySomeTags(tags);

	expect(res).toMatchObject(queryResponse);
});

test("includes params if provided", async () => {
	const seed = expect.getState().currentTestName;

	const tags = ["foo", "bar"];
	const params = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};
	const queryResponse = prismicM.api.query({ seed });

	mockPrismicRestAPIV2({
		server,
		queryResponse,
		queryRequiredParams: {
			access_token: params.accessToken,
			ref: params.ref,
			lang: params.lang,
			q: `[[any(document.tags, [${tags
				.map((tag) => `"${tag}"`)
				.join(", ")}])]]`,
		},
	});

	const client = createTestClient();
	const res = await client.getBySomeTags(tags, params);

	expect(res).toMatchObject(queryResponse);
});

test("is abortable with an AbortController", async () => {
	const controller = new AbortController();
	controller.abort();

	mockPrismicRestAPIV2({ server });

	const client = createTestClient();

	await expect(async () => {
		await client.getBySomeTags(["tag"], {
			signal: controller.signal,
		});
	}).rejects.toThrow(/aborted/i);
});
