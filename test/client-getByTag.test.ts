import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

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

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getByTag("tag", params),
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getByTag("tag", params),
});
