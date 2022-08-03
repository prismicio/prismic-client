import { it, expect } from "vitest";

import { createRef } from "./__testutils__/createRef";
import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createRepositoryResponse } from "./__testutils__/createRepositoryResponse";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

import * as prismic from "../src";

it("returns a ref by ID", async (ctx) => {
	const ref1 = createRef(true);
	const ref2 = createRef(false);
	const response = createRepositoryResponse({ refs: [ref1, ref2] });
	mockPrismicRestAPIV2({
		repositoryHandler: () => response,
		server: ctx.server,
	});

	const client = createTestClient();
	const res = await client.getRefByID(ref2.id);

	expect(res).toStrictEqual(ref2);
});

it("throws if ref could not be found", async (ctx) => {
	mockPrismicRestAPIV2({
		server: ctx.server,
	});

	const client = createTestClient();

	await expect(() => client.getRefByID("non-existant")).rejects.toThrowError(
		/could not be found/i,
	);
	await expect(() => client.getRefByID("non-existant")).rejects.toThrowError(
		prismic.PrismicError,
	);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getRefByID("id", { signal }),
});
