import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetFirstMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetFirstMethod("queries for document by UID", {
	run: (client) => client.getByUID("type", "uid"),
	requiredParams: {
		q: [`[[at(document.type, "type")]]`, `[[at(my.type.uid, "uid")]]`],
	},
})

testGetFirstMethod("includes params if provided", {
	run: (client) =>
		client.getByUID("type", "uid", {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: [`[[at(document.type, "type")]]`, `[[at(my.type.uid, "uid")]]`],
	},
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.getByUID("type", "uid", params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.getByUID("type", "uid", params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getByUID("type", "uid", params),
	mode: "get",
})
