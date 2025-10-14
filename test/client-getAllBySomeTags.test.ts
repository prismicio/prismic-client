import { testAbortableMethod } from "./__testutils__/testAbortableMethod.ts"
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod.ts"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod.ts"
import { testFetchOptions } from "./__testutils__/testFetchOptions.ts"
import { testInvalidRefRetry } from "./__testutils__/testInvalidRefRetry.ts"

testGetAllMethod("returns all documents by some tags from paginated response", {
	run: (client) => client.getAllBySomeTags(["foo", "bar"]),
	requiredParams: {
		q: `[[any(document.tags, ["foo", "bar"])]]`,
	},
})

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllBySomeTags(["foo", "bar"], {
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
	run: (client, params) => client.getAllBySomeTags(["foo", "bar"], params),
})

testInvalidRefRetry({
	run: (client, params) => client.getAllBySomeTags(["foo", "bar"], params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getAllBySomeTags(["foo", "bar"], params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getAllBySomeTags(["foo", "bar"], params),
	mode: "getAll",
})
