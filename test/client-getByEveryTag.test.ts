import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetMethod("queries for documents by tag", {
	run: (client) => client.getByEveryTag(["foo", "bar"]),
	requiredParams: {
		q: `[[at(document.tags, ["foo", "bar"])]]`,
	},
	server,
});

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByEveryTag(["foo", "bar"], {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[at(document.tags, ["foo", "bar"])]]`,
	},
	server,
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByEveryTag(["foo", "bar"], { signal }),
	server,
});
