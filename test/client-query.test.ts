import { testGetMethod } from "./__testutils__/testAnyGetMethod";
import { testAbortableMethod } from "./__testutils__/testAbortableMethod";

import * as prismic from "../src";

const predicate = prismic.predicate.at("document.type", "page");
const q = `[${predicate}]`;

testGetMethod("resolves a query", {
	run: (client) => client.query(predicate),
	requiredParams: {
		q,
	},
});

testGetMethod("includes params if provided", {
	run: (client) =>
		client.query(predicate, {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q,
	},
});

testGetMethod("includes default params if provided", {
	run: (client) => client.query(predicate),
	clientConfig: {
		defaultParams: {
			lang: "*",
		},
	},
	requiredParams: {
		lang: "*",
		q,
	},
});

testGetMethod("merges params and default params if provided", {
	run: (client) =>
		client.query(predicate, {
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
		q,
	},
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.query(predicate, { signal }),
});
