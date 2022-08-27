import { expect, test, vi } from "vitest";
import fetch from "node-fetch";

import { createTestClient } from "./__testutils__/createClient";
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2";
import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

testGetMethod("queries for documents by type", {
	run: (client) => client.getByType("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
});

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByType("type", {
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
	run: (client, signal) => client.getByType("type", { signal }),
});

test("shares concurrent equivalent network requests", async (ctx) => {
	const fetchSpy = vi.fn(fetch);
	const controller1 = new AbortController();
	const controller2 = new AbortController();

	mockPrismicRestAPIV2({ ctx });

	const client = createTestClient({ clientConfig: { fetch: fetchSpy } });

	await Promise.all([
		// Shared: 1 network request
		client.getByType("type"),
		client.getByType("type"),

		// Shared: 1 network request
		client.getByType("type", { signal: controller1.signal }),
		client.getByType("type", { signal: controller1.signal }),

		// Shared: 1 network request
		client.getByType("type", { signal: controller2.signal }),
		client.getByType("type", { signal: controller2.signal }),
	]);

	// Not shared: 2 network requests
	await client.getByType("type");
	await client.getByType("type");

	// Total of 6 requests:
	// - 1x /api/v2 (shared across all requests)
	// - 5x /api/v2/documents/search
	expect(fetchSpy.mock.calls.length).toBe(6);
});
