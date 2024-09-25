import { expect, it } from "vitest"

import { createTestClient } from "./__testutils__/createClient"
import { createPagedQueryResponses } from "./__testutils__/createPagedQueryResponses"
import { mockPrismicRestAPIV2 } from "./__testutils__/mockPrismicRestAPIV2"
import { testAbortableMethod } from "./__testutils__/testAbortableMethod"
import { testGetAllMethod } from "./__testutils__/testAnyGetMethod"
import { testConcurrentMethod } from "./__testutils__/testConcurrentMethod"
import { testFetchOptions } from "./__testutils__/testFetchOptions"

/**
 * The number of milliseconds in which a multi-page `getAll` (e.g. `getAll`,
 * `getAllByType`, `getAllByTag`) will wait between individual page requests.
 *
 * This is done to ensure API performance is sustainable and reduces the chance
 * of a failed API request due to overloading.
 *
 * IMPORTANT: This value is linked to `GET_ALL_QUERY_DELAY` used in
 * `../src/createClient.ts`. The two values do not need to be kept in sync, but
 * note that changing `GET_ALL_QUERY_DELAY` in the public code may have an
 * effect on tests using this test-specific constant.
 */
export const GET_ALL_QUERY_DELAY = 500

/**
 * Tolerance in number of milliseconds for the duration of a simulated network
 * request.
 *
 * If tests are failing due to incorrect timed durations, increase the tolerance
 * amount.
 */
const NETWORK_REQUEST_DURATION_TOLERANCE = 300

testGetAllMethod("returns all documents from paginated response", {
	run: (client) => client.dangerouslyGetAll(),
})

testGetAllMethod("includes params if provided", {
	run: (client) =>
		client.dangerouslyGetAll({
			accessToken: "custom-accessToken",
			ref: "custom-ref",
			lang: "*",
		}),
	requiredParams: {
		access_token: "custom-accessToken",
		ref: "custom-ref",
		lang: "*",
	},
})

testGetAllMethod("includes default params if provided", {
	run: (client) => client.dangerouslyGetAll(),
	clientConfig: {
		defaultParams: {
			lang: "*",
		},
	},
	requiredParams: {
		lang: "*",
	},
})

testGetAllMethod("merges params and default params if provided", {
	run: (client) =>
		client.dangerouslyGetAll({
			accessToken: "overridden-accessToken",
			ref: "overridden-ref",
			lang: "fr-fr",
		}),
	clientConfig: {
		accessToken: "custom-accessToken",
		ref: "custom-ref",
		defaultParams: {
			lang: "*",
		},
	},
	requiredParams: {
		access_token: "overridden-accessToken",
		ref: "overridden-ref",
		lang: "fr-fr",
	},
})

testGetAllMethod(
	"uses the default pageSize when given a falsey pageSize param",
	{
		run: (client) =>
			client.dangerouslyGetAll({
				pageSize: 0,
			}),
		requiredParams: {
			pageSize: "100",
		},
	},
)

testGetAllMethod("optimizes pageSize when limit is below the pageSize", {
	run: (client) =>
		client.dangerouslyGetAll({
			limit: 3,
		}),
	resultLimit: 3,
	requiredParams: {
		pageSize: "3",
	},
})

testGetAllMethod(
	"does not optimize pageSize when limit is above the pageSize",
	{
		run: (client) =>
			client.dangerouslyGetAll({
				limit: 150,
			}),
		resultLimit: 150,
		requiredParams: {
			pageSize: "100",
		},
	},
)

it("throttles requests past first page", async (ctx) => {
	const numPages = 3
	const queryResponses = createPagedQueryResponses({
		ctx,
		pages: numPages,
	})

	const queryDelay = 200

	mockPrismicRestAPIV2({
		ctx,
		queryResponse: queryResponses,
		queryRequiredParams: {
			pageSize: "100",
		},
		queryDelay,
	})

	const client = createTestClient({ ctx })

	const startTime = Date.now()
	await client.dangerouslyGetAll()
	const endTime = Date.now()

	const totalTime = endTime - startTime
	const minTime = numPages * queryDelay + (numPages - 1) * 500
	const maxTime = minTime + NETWORK_REQUEST_DURATION_TOLERANCE

	// The total time should be the amount of time it takes to resolve all
	// network requests in addition to a delay between requests (accounting for
	// some tolerance). The last request does not start an artificial delay.
	expect(
		minTime <= totalTime && totalTime <= maxTime,
		`Total time should be between ${minTime}ms and ${maxTime}ms (inclusive), but was ${totalTime}ms`,
	).toBe(true)
})

it("does not throttle single page queries", async (ctx) => {
	const queryResponses = createPagedQueryResponses({
		ctx,
		pages: 1,
	})
	const queryDelay = 200

	mockPrismicRestAPIV2({
		ctx,
		queryResponse: queryResponses,
		queryRequiredParams: {
			pageSize: "100",
		},
		queryDelay,
	})

	const client = createTestClient({ ctx })

	const startTime = Date.now()
	await client.dangerouslyGetAll()
	const endTime = Date.now()

	const totalTime = endTime - startTime
	const minTime = queryDelay
	const maxTime = minTime + NETWORK_REQUEST_DURATION_TOLERANCE

	// The total time should only be the amount of time it takes to resolve the
	// network request (accounting for some tolerance). In other words, there is
	// no artificial delay in a single page `getAll` query.
	expect(
		minTime <= totalTime && totalTime <= maxTime,
		`Total time should be between ${minTime}ms and ${maxTime}ms (inclusive), but was ${totalTime}ms`,
	).toBe(true)
})

testFetchOptions("supports fetch options", {
	run: (client, params) => client.dangerouslyGetAll(params),
})

testAbortableMethod("is abortable with an AbortController", {
	run: (client, params) => client.dangerouslyGetAll(params),
})

testConcurrentMethod("shares concurrent equivalent network requests", {
	run: (client, params) => client.dangerouslyGetAll(params),
	mode: "getAll",
})
