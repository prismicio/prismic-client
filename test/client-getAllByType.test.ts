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

test("returns all documents by type from paginated response", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const documentType = "foo";
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
		fields: { type: documentType },
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, pagedResponses, undefined, {
			ref: getMasterRef(repositoryResponse),
			q: `[[at(document.type, "${documentType}")]]`,
			pageSize: 100,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByType(documentType);

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};
	const documentType = "foo";
	const pagedResponses = createQueryResponsePages({
		numPages: 3,
		numDocsPerPage: 3,
		fields: { type: documentType },
	});
	const allDocs = pagedResponses.flatMap((page) => page.results);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, pagedResponses, params.accessToken, {
			ref: params.ref as string,
			q: `[[at(document.type, "${documentType}")]]`,
			pageSize: 100,
			lang: params.lang,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getAllByType(documentType, params);

	t.deepEqual(res, allDocs);
	t.is(res.length, 3 * 3);
});
