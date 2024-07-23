import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetFirstMethod("queries for document by ID", {
	run: (client) => client.getByID("id"),
	requiredParams: {
		q: `[[at(document.id, "id")]]`,
	},
})

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
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getByID("id", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getByID("id", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getByID("id", params),
	mode: "get",
})
