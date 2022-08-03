import { it, expect } from "vitest";

import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { createTestClient } from "./__testutils__/createClient";

import * as prismic from "../src";

it("returns a Release by ID", async (ctx) => {
	const ref1 = ctx.mock.api.ref({ isMasterRef: true });
	const ref2 = ctx.mock.api.ref({ isMasterRef: false });
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [ref1, ref2];
	mockPrismicRestAPIV2({
		repositoryResponse,
		ctx,
	});

	const client = createTestClient();
	const res = await client.getReleaseByID(ref2.id);

	expect(res).toStrictEqual(ref2);
});

it("throws if Release could not be found", async (ctx) => {
	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient();

	await expect(() =>
		client.getReleaseByID("non-existant"),
	).rejects.toThrowError(/could not be found/i);
	await expect(() =>
		client.getReleaseByID("non-existant"),
	).rejects.toThrowError(prismic.PrismicError);
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getReleaseByID("id", { signal }),
});
