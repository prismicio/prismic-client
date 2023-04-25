import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod";
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod";

testGetFirstMethod("queries for document by ID", {
	run: (client) => client.getByID("id"),
	requiredParams: {
		q: `[[at(document.id, "id")]]`,
	},
});

testGetFirstMethod("includes params if provided", {
	run: (client) =>
		client.getByID("id", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[at(document.id, "id")]]`,
	},
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByID("id", { signal }),
});

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getByID("id", params),
	mode: "get",
});
