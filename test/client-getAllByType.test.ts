import { testAbortableMethod } from "./__testutils__/testAbortableMethod.ts"
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod.ts"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod.ts"
import { testFetchOptions } from "./__testutils__/testFetchOptions.ts"
import { testInvalidRefRetry } from "./__testutils__/testInvalidRefRetry.ts"

testGetAllMethod("returns all documents by type from paginated response", {
	run: (client) => client.getAllByType("type"),
	requiredParams: {
		q: `[[at(document.type, "type")]]`,
	},
})

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
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getAllByType("type", params),
})

testInvalidRefRetry({
	run: (client, params) => client.getAllByType("type", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getAllByType("type", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getAllByType("type", params),
	mode: "getAll",
})
