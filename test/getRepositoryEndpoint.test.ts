import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns default Rest API V2 CDN URL", () => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty")

	expect(endpoint).toBe("https://qwerty.cdn.prismic.io/api/v2")
})

it("throws if an invalid repository name is given", () => {
	expect(() => {
		prismic.getRepositoryEndpoint("this is invalid")
	}).toThrowError(
		/An invalid Prismic repository name was given: this is invalid/i,
	)
	expect(() => {
		prismic.getRepositoryEndpoint("this is invalid")
	}).toThrowError(prismic.PrismicError)
})
