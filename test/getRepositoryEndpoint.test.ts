import { it } from "./it"

import { PrismicError, getRepositoryEndpoint } from "../src"

it("returns Content API CDN URL", async ({ expect }) => {
	const endpoint = getRepositoryEndpoint("example")
	expect(endpoint).toBe("https://example.cdn.prismic.io/api/v2")
})

it("throws if an invalid repository name is given", async ({ expect }) => {
	expect(() => getRepositoryEndpoint("this is invalid")).toThrow(
		/invalid Prismic repository name/i,
	)
	expect(() => getRepositoryEndpoint("this is invalid")).toThrow(PrismicError)
})
