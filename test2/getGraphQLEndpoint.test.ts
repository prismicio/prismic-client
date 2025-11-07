import { it } from "./it"

import { PrismicError, getGraphQLEndpoint } from "../src"

it("returns GraphQL API CDN URL", async ({ expect }) => {
	const endpoint = getGraphQLEndpoint("example")
	expect(endpoint).toBe("https://example.cdn.prismic.io/graphql")
})

it("throws if an invalid repository name is given", async ({ expect }) => {
	expect(() => getGraphQLEndpoint("this is invalid")).toThrow(
		/invalid Prismic repository name/i,
	)
	expect(() => getGraphQLEndpoint("this is invalid")).toThrow(PrismicError)
})
