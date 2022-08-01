import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetFirstMethod("queries for document by ID", {
	run: (client) => client.getByID("id"),
	requiredParams: {
		q: `[[at(document.id, "id")]]`,
	},
	server,
});

testGetFirstMethod("includes params if provided", {
	run: (client) =>
		client.getByID("id", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[at(document.id, "id")]]`,
	},
	server,
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByID("id", { signal }),
	server,
});
