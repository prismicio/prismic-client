import test from "ava";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createQueryResponsePages } from "./__testutils__/createQueryResponsePages";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all documents by tag from paginated response", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const documentTag = "foo";
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
		fields: { tags: [documentTag] },
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, pagedResponses, undefined, {
			ref: getMasterRef(repositoryResponse),
			q: `[[any(document.tags, ["${documentTag}"])]]`,
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByTag(documentTag);

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};
	const documentTag = "foo";
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
		fields: { tags: [documentTag] },
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, pagedResponses, params.accessToken, {
			ref: params.ref as string,
			q: `[[any(document.tags, ["${documentTag}"])]]`,
			lang: params.lang,
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByTag(documentTag, params);

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});

test("is abortable with an AbortController", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
		}),
	);

	const client = createTestClient(t);

	await t.throwsAsync(
		async () => {
			const controller = new AbortController();
			controller.abort();

			await client.getAllByTag("tag", {
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
