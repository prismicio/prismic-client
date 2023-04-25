import { testAbortableMethod } from "./__testutils__/testAbortableMethod";
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod";
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod";

testGetAllMethod("returns all documents by IDs from paginated response", {
	run: (client) => client.getAllByIDs(["id1", "id2"]),
	requiredParams: {
		q: `[[in(document.id, ["id1", "id2"])]]`,
	},
});

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.getAllByIDs(["id1", "id2"], {
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
});

testAbortableMethod("is abortable with an AbortController", {
	run: (client, signal) => client.getAllByIDs(["id1", "id2"], { signal }),
});

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.getAllByIDs(["id1", "id2"], params),
	mode: "getAll",
});
