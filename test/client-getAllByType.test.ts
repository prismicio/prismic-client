import { expect, test, vi } from "vitest";
import fetch from "node-fetch";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { createPagedQueryResponses } from "./__testutils__/createPagedQueryResponses";

testGetAllMethod("returns all documents by type from paginated response", {
	run: (client) => client.getAllByType("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
});

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByType("type", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[at(document.type, "type")]]`,
	},
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getAllByType("tag", { signal }),
});

test("shares concurrent equivalent network requests", async (ctx) => {
	const fetchSpy = vi.fn(fetch);
	const controller1 = new AbortController();
	const controller2 = new AbortController();

	const queryResponses = createPagedQueryResponses({ ctx });

	mockPrismicRestAPIV2({ ctx, queryResponse: queryResponses });

	const client = createTestClient({ clientConfig: { fetch: fetchSpy } });

	await Promise.all([
		// Shared: 2 network request (1 per page)
		client.getAllByType("type"),
		client.getAllByType("type"),

		// Shared: 2 network request (1 per page)
		client.getAllByType("type", { signal: controller1.signal }),
		client.getAllByType("type", { signal: controller1.signal }),

		// Shared: 2 network request (1 per page)
		client.getAllByType("type", { signal: controller2.signal }),
		client.getAllByType("type", { signal: controller2.signal }),
	]);

	// Not shared: 2 network requests (1 per page)
	await client.getAllByType("type");

	// Not shared: 2 network requests (1 per page)
	await client.getAllByType("type");

	// Total of 11 requests:
	// - 1x /api/v2 (shared across all requests)
	// - 10x /api/v2/documents/search
	expect(fetchSpy.mock.calls.length).toBe(11);
});
