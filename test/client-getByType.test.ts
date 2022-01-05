import test from "ava";
import * as mswNode from "msw/node";

import { createDocument } from "./__testutils__/createDocument";
import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { createTestClient } from "./__testutils__/createClient";
import { getMasterRef } from "./__testutils__/getMasterRef";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("queries for documents by type", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const documentType = "foo";
	const queryResponse = createQueryResponse([
		createDocument({ type: documentType }),
		createDocument({ type: documentType }),
	]);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			q: `[[at(document.type, "${documentType}")]]`,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getByType(documentType);

	t.deepEqual(res, queryResponse);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};

	const documentType = "foo";
	const queryResponse = createQueryResponse([
		createDocument({ type: documentType }),
		createDocument({ type: documentType }),
	]);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], params.accessToken, {
			ref: params.ref as string,
			q: `[[at(document.type, "${documentType}")]]`,
			lang: params.lang,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getByType(documentType, params);

	t.deepEqual(res, queryResponse);
});
