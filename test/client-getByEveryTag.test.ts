import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetMethod("queries for documents by tag", {
	run: (client) => client.getByEveryTag(["foo", "bar"]),
	requiredParams: {
		q: `[[at(document.tags, ["foo", "bar"])]]`,
	},
})

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByEveryTag(["foo", "bar"], {
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
	run: (client, params) => client.getByEveryTag(["foo", "bar"], params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getByEveryTag(["foo", "bar"], params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getByEveryTag(["foo", "bar"], params),
	mode: "get",
})
