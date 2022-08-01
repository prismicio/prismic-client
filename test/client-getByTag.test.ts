import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetMethod("queries for documents by tag", {
	run: (client) => client.getByTag("tag"),
	requiredParams: {
		q: `[[any(document.tags, ["tag"])]]`,
	},
	server,
});

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByTag("tag", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[any(document.tags, ["tag"])]]`,
	},
	server,
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByTag("tag", { signal }),
	server,
});
