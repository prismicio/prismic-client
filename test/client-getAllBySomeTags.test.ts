import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod";
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod";

testGetAllMethod("returns all documents by some tags from paginated response", {
	run: (client) => client.getAllBySomeTags(["foo", "bar"]),
	requiredParams: {
		q: `[[any(document.tags, ["foo", "bar"])]]`,
	},
});

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllBySomeTags(["foo", "bar"], {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[any(document.tags, ["foo", "bar"])]]`,
	},
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getAllBySomeTags(["foo", "bar"], { signal }),
});

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getAllBySomeTags(["foo", "bar"], params),
	mode: "getAll",
});
