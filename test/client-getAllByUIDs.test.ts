import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetAllMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetAllMethod("returns all documents by UIDs from paginated response", {
	run: (client) => client.getAllByUIDs("type", ["uid1", "uid2"]),
	requiredParams: {
		q: [
			`[[at(document.type, "type")]]`,
			`[[in(my.type.uid, ["uid1", "uid2"])]]`,
		],
	},
	server,
});

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByUIDs("type", ["uid1", "uid2"], {
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
		client.getAllByUIDs("type", ["uid1", "uid2"], { signal }),
	server,
});
