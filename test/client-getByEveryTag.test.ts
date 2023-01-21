import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testGetMethod } from "./__testutils__/testAnyGetMethod";

testGetMethod("queries for documents by tag", {
	run: (client) => client.getByEveryTag(["foo", "bar"]),
	requiredParams: {
		q: `[[at(document.tags, ["foo", "bar"])]]`,
	},
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
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByEveryTag(["foo", "bar"], { signal }),
});
