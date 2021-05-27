import test from "ava";
import * as mswNode from "msw/node";

import { createDocument } from "./__testutils__/createDocument";
import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("queries for documents by id", async t => {
	const documents = [createDocument(), createDocument()];
	const documentIds = documents.map(doc => doc.id);
	const queryResponse = createQueryResponse(documents);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: "masterRef",
			q: `[[at(document.id, [${documentIds.map(id => `"${id}"`).join(", ")}])]]`
		})
	);

	const client = createTestClient(t);
	const res = await client.getByIDs(documentIds);

	t.deepEqual(res, queryResponse);
});

test("includes params if provided", async t => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*"
	};

	const documents = [createDocument(), createDocument()];
	const documentIds = documents.map(doc => doc.id);
	const queryResponse = createQueryResponse(documents);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], params.accessToken, {
			ref: params.ref as string,
			q: `[[at(document.id, [${documentIds
				.map(id => `"${id}"`)
				.join(", ")}])]]`,
			lang: params.lang
		})
	);

	const client = createTestClient(t);
	const res = await client.getByIDs(documentIds, params);

	t.deepEqual(res, queryResponse);
});
