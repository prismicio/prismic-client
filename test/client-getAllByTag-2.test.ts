import { test, expect, afterAll, beforeAll } from "vitest";
import * as mswNode from "msw/node";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";
import AbortController from "abort-controller";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

type GetPagedQueryResponsesArgs = {
	pages?: number;
	pageSize?: number;
};

const createPagedQueryResponses = ({
	pages = 2,
	pageSize = 1,
}: GetPagedQueryResponsesArgs = {}): prismicT.Query[] => {
	const seed = expect.getState().currentTestName;

	const documents = [];
	for (let i = 0; i < pages * pageSize; i++) {
		documents.push(prismicM.value.document({ seed: seed }));
	}

	const responses = [];

	for (let page = 1; page <= pages; page++) {
		responses.push(
			prismicM.api.query({
				seed,
				pageSize,
				page,
				documents,
			}),
		);
	}

	return responses;
};

test("returns all documents by tag from paginated response", async () => {
	const tag = "foo";
	const queryResponses = createPagedQueryResponses();
	const allDocs = Object.values(queryResponses).flatMap((page) => page.results);

	mockPrismicRestAPIV2({
		server,
		queryResponses,
		queryRequiredParams: {
			q: `[[any(document.tags, ["${tag}"])]]`,
			pageSize: "100",
		},
	});

	const client = createTestClient();
	const res = await client.getAllByTag(tag);

	expect(res).toEqual(allDocs);
});

test("includes params if provided", async () => {
	const tag = "foo";
	const params = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};
	const queryResponses = createPagedQueryResponses();
	const allDocs = Object.values(queryResponses).flatMap((page) => page.results);

	mockPrismicRestAPIV2({
		server,
		queryResponses,
		queryRequiredParams: {
			access_token: params.accessToken,
			ref: params.ref,
			lang: params.lang,
			q: `[[any(document.tags, ["${tag}"])]]`,
			pageSize: "100",
		},
	});

	const client = createTestClient();
	const res = await client.getAllByTag(tag, params);

	expect(res).toMatchObject(allDocs);
});

test("is abortable with an AbortController", async () => {
	const controller = new AbortController();
	controller.abort();

	mockPrismicRestAPIV2({ server });

	const client = createTestClient();

	await expect(async () => {
		await client.getAllByTag("tag", {
			signal: controller.signal,
		});
	}).rejects.toThrow(/aborted/i);
});
