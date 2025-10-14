import { testAbortableMethod } from "./__testutils__/testAbortableMethod.ts"
import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod.ts"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod.ts"
import { testFetchOptions } from "./__testutils__/testFetchOptions.ts"
import { testInvalidRefRetry } from "./__testutils__/testInvalidRefRetry.ts"

testGetFirstMethod("queries for singleton document", {
	run: (client) => client.getSingle("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
})

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
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getSingle("type", params),
})

testInvalidRefRetry({
	run: (client, params) => client.getSingle("type", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getSingle("type", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getSingle("type", params),
	mode: "get",
})
