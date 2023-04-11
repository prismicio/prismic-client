import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod";
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod";

testGetAllMethod("returns all documents by type from paginated response", {
	run: (client) => client.getAllByType("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
});

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByType("type", {
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

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getAllByType("type", { signal }),
});

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, signal) => client.getAllByType("type", { signal }),
	mode: "getAll",
});
