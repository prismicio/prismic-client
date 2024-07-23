import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetAllMethod("returns all documents by tag from paginated response", {
	run: (client) => client.getAllByTag("tag"),
	requiredParams: {
		q: `[[any(document.tags, ["tag"])]]`,
	},
})

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByTag("tag", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[any(document.tags, ["tag"])]]`,
	},
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getAllByTag("tag", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getAllByTag("tag", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getAllByTag("tag", params),
	mode: "getAll",
})
