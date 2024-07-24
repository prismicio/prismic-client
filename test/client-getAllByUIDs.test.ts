import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

testGetAllMethod("returns all documents by UIDs from paginated response", {
	run: (client) => client.getAllByUIDs("type", ["uid1", "uid2"]),
	requiredParams: {
		q: [
			`[[at(document.type, "type")]]`,
			`[[in(my.type.uid, ["uid1", "uid2"])]]`,
		],
	},
})

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByUIDs("type", ["uid1", "uid2"], {
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
		q: [
			`[[at(document.type, "type")]]`,
			`[[in(my.type.uid, ["uid1", "uid2"])]]`,
		],
	},
})

testFetchOptions("supports fetch options", {
	run: (client, params) =>
		client.getAllByUIDs("type", ["uid1", "uid2"], params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) =>
		client.getAllByUIDs("type", ["uid1", "uid2"], params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) =>
		client.getAllByUIDs("type", ["uid1", "uid2"], params),
	mode: "getAll",
})
