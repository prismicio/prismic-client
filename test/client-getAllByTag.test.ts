import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetAllMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetAllMethod("returns all documents by tag from paginated response", {
	run: (client) => client.getAllByTag("tag"),
	requiredParams: {
		q: `[[any(document.tags, ["tag"])]]`,
	},
	server,
});

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByTag("tag", {
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
	run: (client, signal) => client.getAllByTag("tag", { signal }),
	server,
});
