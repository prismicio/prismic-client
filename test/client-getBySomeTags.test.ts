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

test("queries for documents by tag", async (t) => {
	const repositoryResponse = createRepositoryResponse();
	const documentTags = ["foo", "bar"];
	const queryResponse = createQueryResponse([
		createDocument({ tags: documentTags }),
		createDocument({ tags: documentTags }),
	]);

	server.use(
		createMockRepositoryHandler(t, repositoryResponse),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: getMasterRef(repositoryResponse),
			q: `[[any(document.tags, [${documentTags
				.map((tag) => `"${tag}"`)
				.join(", ")}])]]`,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getBySomeTags(documentTags);

	t.deepEqual(res, queryResponse);
});

test("includes params if provided", async (t) => {
	const params: prismic.BuildQueryURLArgs = {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	};

	const documentTags = ["foo", "bar"];
	const queryResponse = createQueryResponse([
		createDocument({ tags: documentTags }),
		createDocument({ tags: documentTags }),
	]);

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], params.accessToken, {
			ref: params.ref as string,
			q: `[[any(document.tags, [${documentTags
				.map((tag) => `"${tag}"`)
				.join(", ")}])]]`,
			lang: params.lang,
		}),
	);

	const client = createTestClient(t);
	const res = await client.getBySomeTags(documentTags, params);

	t.deepEqual(res, queryResponse);
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

			await client.getBySomeTags(["tag"], {
				signal: controller.signal,
			});
		},
		{ name: "AbortError" },
	);
});
