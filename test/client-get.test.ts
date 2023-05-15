import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

testGetMethod("resolves a query", {
	run: (client) => client.get(),
});

testGetMethod("includes params if provided", {
	run: (client) =>
		client.get({
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	},
});

testGetMethod("includes default params if provided", {
	run: (client) => client.get(),
	clientConfig: {
		defaultParams: {
			lang: "*",
		},
	},
	requiredParams: {
		lang: "*",
	},
});

testGetMethod("merges params and default params if provided", {
	run: (client) =>
		client.get({
			accessToken: "overridden-accessToken",
			ref: "overridden-ref",
			lang: "fr-fr",
		}),
	clientConfig: {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: {
			lang: "*",
		},
	},
	requiredParams: {
		access_token: "overridden-accessToken",
		ref: "overridden-ref",
		lang: "fr-fr",
	},
});

testFetchOptions("supports fetch options", {
	run: (client, params) => client.get(params),
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.get(params),
});
