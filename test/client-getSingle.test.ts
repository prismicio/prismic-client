import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

testGetFirstMethod("queries for singleton document", {
	run: (client) => client.getSingle("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
});

testGetFirstMethod("includes params if provided", {
	run: (client) =>
		client.getSingle("type", {
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
});

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getSingle("type", params),
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getSingle("type", params),
});
