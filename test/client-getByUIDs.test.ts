import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetMethod("queries for documents by UIDs", {
	run: (client) => client.getByUIDs("type", ["uid1", "uid2"]),
	requiredParams: {
		q: [
			`[[at(document.type, "type")]]`,
			`[[in(my.type.uid, ["uid1", "uid2"])]]`,
		],
	},
	server,
});

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByUIDs("type", ["uid1", "uid2"], {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: [
			`[[at(document.type, "type")]]`,
			`[[in(my.type.uid, ["uid1", "uid2"])]]`,
		],
	},
	server,
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) =>
		client.getByUIDs("type", ["uid1", "uid2"], { signal }),
	server,
});
