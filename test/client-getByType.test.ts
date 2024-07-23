import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetMethod("queries for documents by type", {
	run: (client) => client.getByType("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
})

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByType("type", {
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
	run: (client, params) => client.getByType("type", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getByType("type", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getByType("type", params),
	mode: "get",
})
