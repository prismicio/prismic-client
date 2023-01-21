import * as prismicM from "@prismicio/mock";
import { Headers } from "node-fetch";
import { expect, it } from "vitest";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const previewToken = "previewToken";

it("resolves a preview url in the browser", async (ctx) => {
	const seed = ctx.meta.name;
	const document = { ...prismicM.value.document({ seed }), uid: seed };
	const queryResponse = prismicM.api.query({ seed, documents: [document] });

	globalThis.location = {
		...globalThis.location,
		search: `?documentId=${document.id}&token=${previewToken}`,
	};

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	});

	const client = createTestClient();
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
	});

	expect(res).toBe(`/${document.uid}`);

	// @ts-expect-error - Need to reset back to Node.js's default globalThis without `location`
	globalThis.location = undefined;
});

it("resolves a preview url using a server req object", async (ctx) => {
	const seed = ctx.meta.name;
	const document = { ...prismicM.value.document({ seed }), uid: seed };
	const queryResponse = prismicM.api.query({ seed, documents: [document] });

	const req = {
		query: { documentId: document.id, token: previewToken },
		// This `url` property simulates a Next.js request. It is a
		// partial URL only containing the pathname + search params.
		url: `/foo?bar=baz`,
	};

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	});

	const client = createTestClient();
	client.enableAutoPreviewsFromReq(req);
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
	});

	expect(res).toBe(`/${document.uid}`);
});

it("resolves a preview url using a Web API-based server req object", async (ctx) => {
	const seed = ctx.meta.name;
	const document = { ...prismicM.value.document({ seed }), uid: seed };
	const queryResponse = prismicM.api.query({ seed, documents: [document] });

	const headers = new Headers();
	const url = new URL("https://example.com");
	url.searchParams.set("documentId", document.id);
	url.searchParams.set("token", previewToken);
	const req = {
		headers,
		url: url.toString(),
	};

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	});

	const client = createTestClient();
	client.enableAutoPreviewsFromReq(req);
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
	});

	expect(res).toBe(`/${document.uid}`);
});

it("allows providing an explicit documentId and previewToken", async (ctx) => {
	const seed = ctx.meta.name;
	const document = { ...prismicM.value.document({ seed }), uid: seed };
	const queryResponse = prismicM.api.query({ seed, documents: [document] });

	const req = {
		query: {
			documentId: "this will not be used",
			token: "this will not be used",
		},
	};

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	});

	const client = createTestClient();
	client.enableAutoPreviewsFromReq(req);
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL: "defaultURL",
		documentID: document.id,
		previewToken,
	});

	expect(res).toBe(`/${document.uid}`);
});

it("returns defaultURL if current url does not contain preview params in browser", async () => {
	const defaultURL = "defaultURL";

	// Set a global Location object without the parameters we need for automatic
	// preview support.
	globalThis.location = { ...globalThis.location, search: "" };

	const client = createTestClient();
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL,
	});

	expect(res).toBe(defaultURL);

	// @ts-expect-error - Need to reset back to Node.js's default globalThis without `location`
	globalThis.location = undefined;
});

it("returns defaultURL if req does not contain preview params in server req object", async () => {
	const defaultURL = "defaultURL";
	const req = {};

	const client = createTestClient();
	client.enableAutoPreviewsFromReq(req);
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL,
	});

	expect(res).toBe(defaultURL);
});

it("returns defaultURL if no preview context is available", async () => {
	const defaultURL = "defaultURL";

	const client = createTestClient();
	const res = await client.resolvePreviewURL({
		linkResolver: (document) => `/${document.uid}`,
		defaultURL,
	});

	expect(res).toBe(defaultURL);
});

it("returns defaultURL if resolved URL is not a string", async (ctx) => {
	const seed = ctx.meta.name;
	const document = {
		...prismicM.value.document({ seed, withURL: false }),
		uid: seed,
	};
	const queryResponse = prismicM.api.query({ seed, documents: [document] });
	const defaultURL = "defaultURL";

	mockPrismicRestAPIV2({
		queryResponse,
		queryRequiredParams: {
			ref: previewToken,
			lang: "*",
			pageSize: "1",
			q: `[[at(document.id, "${document.id}")]]`,
		},
		ctx,
	});

	const client = createTestClient();
	const res = await client.resolvePreviewURL({
		linkResolver: () => null,
		defaultURL,
		documentID: document.id,
		previewToken,
	});

	expect(res).toBe(defaultURL);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) =>
		client.resolvePreviewURL({
			signal,
			defaultURL: "defaultURL",
			documentID: "foo",
			previewToken,
		}),
});
