import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod";

testGetMethod("queries for documents by tag", {
	run: (client) => client.getByTag("tag"),
	requiredParams: {
		q: `[[any(document.tags, ["tag"])]]`,
	},
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
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByTag("tag", { signal }),
});

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, signal) => client.getByTag("tag", { signal }),
	mode: "get",
});
