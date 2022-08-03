import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

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

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getSingle("type", { signal }),
});
