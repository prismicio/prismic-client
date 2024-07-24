import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetAllMethod("returns all documents by every tag from paginated response", {
	run: (client) => client.getAllByEveryTag(["foo", "bar"]),
	requiredParams: {
		q: `[[at(document.tags, ["foo", "bar"])]]`,
	},
})

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByEveryTag(["foo", "bar"], {
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
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getAllByEveryTag(["foo", "bar"], params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getAllByEveryTag(["foo", "bar"], params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getAllByEveryTag(["foo", "bar"], params),
	mode: "getAll",
})
