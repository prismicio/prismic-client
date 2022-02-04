import test from "ava";
import * as mswNode from "msw/node";
import AbortController from "abort-controller";

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

test("queries for document by UID", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const document = createDocument();
	const queryResponse = createQueryResponse([document]);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			q: [
				`[[at(document.type, "${document.type}")]]`,
				`[[at(my.${document.type}.uid, "${document.uid}")]]`,
			],
		}),
	);

	const client = createTestClient(t);
	const res = await client.getByUID(document.type, document.uid);

	t.deepEqual(res, document);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};

	const document = createDocument();
	const queryResponse = createQueryResponse([document]);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], params.accessToken, {
			ref: params.ref as string,
			q: [
				`[[at(document.type, "${document.type}")]]`,
				`[[at(my.${document.type}.uid, "${document.uid}")]]`,
			],
			lang: params.lang,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getByUID(document.type, document.uid, params);

	t.deepEqual(res, document);
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

			await client.getByUID("type", "uid", {
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
