import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

testGetFirstMethod("queries for document by UID", {
	run: (client) => client.getByUID("type", "uid"),
	requiredParams: {
		q: [`[[at(document.type, "type")]]`, `[[at(my.type.uid, "uid")]]`],
	},
});

testGetFirstMethod("includes params if provided", {
	run: (client) =>
		client.getByUID("type", "uid", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: [`[[at(document.type, "type")]]`, `[[at(my.type.uid, "uid")]]`],
	},
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getByUID("type", "uid", { signal }),
});
