import { beforeAll, afterAll } from "vitest";
import * as mswNode from "msw/node";

import { testGetAllMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

const server = mswNode.setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

testGetAllMethod("returns all documents by every tag from paginated response", {
	run: (client) => client.getAllByEveryTag(["foo", "bar"]),
	requiredParams: {
		q: `[[at(document.tags, ["foo", "bar"])]]`,
	},
	server,
});

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByEveryTag(["foo", "bar"], {
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
	run: (client, signal) => client.getAllByEveryTag(["foo", "bar"], { signal }),
	server,
});
