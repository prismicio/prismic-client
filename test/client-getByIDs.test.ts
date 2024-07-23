import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetMethod("queries for documents by IDs", {
	run: (client) => client.getByIDs(["id1", "id2"]),
	requiredParams: {
		q: `[[in(document.id, ["id1", "id2"])]]`,
	},
})

testGetMethod("includes params if provided", {
	run: (client) =>
		client.getByIDs(["id1", "id2"], {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: `[[in(document.id, ["id1", "id2"])]]`,
	},
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getByIDs(["id1", "id2"], params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getByIDs(["id1", "id2"], params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getByIDs(["id1", "id2"], params),
	mode: "get",
})
