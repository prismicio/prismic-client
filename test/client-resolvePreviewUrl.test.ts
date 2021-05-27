import test from "ava";
import * as mswNode from "msw/node";

import { createDocument } from "./__testutils__/createDocument";
import { createMockQueryHandler } from "./__testutils__/createMockQueryHandler";
import { createMockRepositoryHandler } from "./__testutils__/createMockRepositoryHandler";
import { createQueryResponse } from "./__testutils__/createQueryResponse";
import { createTestClient } from "./__testutils__/createClient";

import * as prismicT from "@prismicio/types";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

// Tests in this file must be serial because some test mutate globalThis which
// could affect others.

test.serial("resolves a preview url in the browser", async t => {
	const document = createDocument();
	const queryResponse = createQueryResponse([document]);

	const documentId = document.id;
	const previewToken = "previewToken";

	globalThis.location = {
		...globalThis.location,
		search: `?documentId=${documentId}&token=${previewToken}`
	};

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: previewToken,
			q: `[[at(document.id, "${documentId}")]]`
		})
	);

	const client = createTestClient(t);
	const res = await client.resolvePreviewUrl({
		linkResolver: (document: prismicT.PrismicDocument) => `/${document.uid}`,
		defaultUrl: "defaultUrl"
	});

	t.is(res, `/${document.uid}`);

	// @ts-expect-error - Need to reset back to Node.js's default globalThis without `location`
	globalThis.location = undefined;
});

test.serial("resolves a preview url using a server req object", async t => {
	const document = createDocument();
	const queryResponse = createQueryResponse([document]);

	const documentId = document.id;
	const previewToken = "previewToken";
	const req = { query: { documentId, token: previewToken } };

	server.use(
		createMockRepositoryHandler(t),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref: previewToken,
			q: `[[at(document.id, "${documentId}")]]`
		})
	);

	const client = createTestClient(t);
	client.enableAutoPreviewsFromReq(req);
	const res = await client.resolvePreviewUrl({
		linkResolver: (document: prismicT.PrismicDocument) => `/${document.uid}`,
		defaultUrl: "defaultUrl"
	});

	t.is(res, `/${document.uid}`);
});

test.serial(
	"allows providing an explicit documentId and previewToken",
	async t => {
		const document = createDocument();
		const queryResponse = createQueryResponse([document]);

		const documentId = document.id;
		const previewToken = "previewToken";
		const req = {
			query: {
				documentId: "this will be unused",
				token: "this will be unused"
			}
		};

		server.use(
			createMockRepositoryHandler(t),
			createMockQueryHandler(t, [queryResponse], undefined, {
				ref: previewToken,
				q: `[[at(document.id, "${documentId}")]]`
			})
		);

		const client = createTestClient(t);
		client.enableAutoPreviewsFromReq(req);
		const res = await client.resolvePreviewUrl({
			linkResolver: (document: prismicT.PrismicDocument) => `/${document.uid}`,
			defaultUrl: "defaultUrl",
			documentId,
			previewToken
		});

		t.is(res, `/${document.uid}`);
	}
);

test.serial(
	"returns defaultUrl if current url does not contain preview params in browser",
	async t => {
		const defaultUrl = "defaultUrl";

		// Set a global Location object without the parameters we need for automatic
		// preview support.
		globalThis.location = { ...globalThis.location, search: "" };

		const client = createTestClient(t);
		const res = await client.resolvePreviewUrl({
			linkResolver: (document: prismicT.PrismicDocument) => `/${document.uid}`,
			defaultUrl
		});

		t.is(res, defaultUrl);

		// @ts-expect-error - Need to reset back to Node.js's default globalThis without `location`
		globalThis.location = undefined;
	}
);

test.serial(
	"returns defaultUrl if req does not contain preview params in server req object",
	async t => {
		const defaultUrl = "defaultUrl";
		const req = { query: {} };

		const client = createTestClient(t);
		client.enableAutoPreviewsFromReq(req);
		const res = await client.resolvePreviewUrl({
			linkResolver: (document: prismicT.PrismicDocument) => `/${document.uid}`,
			defaultUrl
		});

		t.is(res, defaultUrl);
	}
);

test.serial(
	"returns defaultUrl if no preview context is available",
	async t => {
		const defaultUrl = "defaultUrl";

		const client = createTestClient(t);
		const res = await client.resolvePreviewUrl({
			linkResolver: (document: prismicT.PrismicDocument) => `/${document.uid}`,
			defaultUrl
		});

		t.is(res, defaultUrl);
	}
);
