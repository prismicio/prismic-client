import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetFirstMethod("queries for document by UID", {
	run: (client) => client.getByUID("type", "uid"),
	requiredParams: {
		q: [`[[at(document.type, "type")]]`, `[[at(my.type.uid, "uid")]]`],
	},
	server,
});

testGetFirstMethod("includes params if provided", {
	run: (client) =>
		client.getByUID("type", "uid", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: [`[[at(document.type, "type")]]`, `[[at(my.type.uid, "uid")]]`],
	},
	server,
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByUID("type", "uid", { signal }),
	server,
});
