import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns default GraphQL API CDN URL", () => {
	const endpoint = prismic.getGraphQLEndpoint("qwerty")

	expect(endpoint).toBe("https://qwerty.cdn.prismic.io/graphql")
})

it("throws if an invalid repository name is given", () => {
	expect(() => {
		prismic.getGraphQLEndpoint("this is invalid")
	}).toThrowError(
		/an invalid Prismic repository name was given: this is invalid/i,
	)
	expect(() => {
		prismic.getGraphQLEndpoint("this is invalid")
	}).toThrowError(prismic.PrismicError)
})
