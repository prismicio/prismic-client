import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetMethod("queries for documents by some tags", {
	run: (client) => client.getBySomeTags(["foo", "bar"]),
	requiredParams: {
		q: `[[any(document.tags, ["foo", "bar"])]]`,
	},
})

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getBySomeTags(["foo", "bar"], {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[any(document.tags, ["foo", "bar"])]]`,
	},
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getBySomeTags(["foo", "bar"], params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getBySomeTags(["foo", "bar"], params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getBySomeTags(["foo", "bar"], params),
	mode: "get",
})
