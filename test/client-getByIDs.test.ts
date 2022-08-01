import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetMethod("queries for documents by IDs", {
	run: (client) => client.getByIDs(["id1", "id2"]),
	requiredParams: {
		q: `[[in(document.id, ["id1", "id2"])]]`,
	},
	server,
});

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByIDs(["id1", "id2"], {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[in(document.id, ["id1", "id2"])]]`,
	},
	server,
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByIDs(["id1", "id2"], { signal }),
	server,
});
