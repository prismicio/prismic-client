import test from "ava";
import * as mswNode from "msw/node";

import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponsePages } from "./__testutils__/createQueryResponsePages";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

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

	const allDocumentIds = allDocs.map((doc) => doc.id);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, pagedResponses, undefined, {
			ref: getMasterRef(repositoryResponse),
			q: `[[in(document.id, [${allDocumentIds
				.map((id) => `"${id}"`)
				.join(", ")}])]]`,
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByIDs(allDocumentIds.filter(Boolean));

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
	const allDocumentIds = allDocs.map((doc) => doc.id);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, pagedResponses, params.accessToken, {
			ref: params.ref as string,
			q: `[[in(document.id, [${allDocumentIds
				.map((id) => `"${id}"`)
				.join(", ")}])]]`,
			pageSize: 100,
			lang: params.lang,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByIDs(allDocumentIds, params);

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});
