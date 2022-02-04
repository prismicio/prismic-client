import test from "ava";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponsePages } from "./__testutils__/createQueryResponsePages";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";
import { createQueryResponse } from "./__testutils__/createQueryResponse";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all matching documents from paginated response", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const pagedResponses = createQueryResponsePages({
		numPages: 2,
		numDocsPerPage: 2,
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);
	const allDocumentUIDs = allDocs.map((doc) => doc.uid as string);
	const documentType = allDocs[0].type;

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, pagedResponses, undefined, {
			ref: getMasterRef(repositoryResponse),
			q: [
				`[[at(document.type, "${documentType}")]]`,
				`[[in(my.${documentType}.uid, [${allDocumentUIDs
					.map((uid) => `"${uid}"`)
					.join(", ")}])]]`,
			],
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByUIDs(documentType, allDocumentUIDs);

	t.deepEqual(res, allDocs);
	t.is(res.length, 2 * 2);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);
	const allDocumentUIDs = allDocs.map((doc) => doc.uid as string);
	const documentType = allDocs[0].type;

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, pagedResponses, params.accessToken, {
			ref: params.ref as string,
			q: [
				`[[at(document.type, "${documentType}")]]`,
				`[[in(my.${documentType}.uid, [${allDocumentUIDs
					.map((uid) => `"${uid}"`)
					.join(", ")}])]]`,
			],
			lang: params.lang,
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByUIDs(documentType, allDocumentUIDs, params);

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

			await client.getAllByUIDs("type", ["uid"], {
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
