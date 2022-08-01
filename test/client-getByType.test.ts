import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetMethod("queries for documents by type", {
	run: (client) => client.getByType("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
	server,
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
	server,
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByType("type", { signal }),
	server,
});
