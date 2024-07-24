import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns a URL for the Prismic Toolbar script", () => {
	const endpoint = prismic.getToolbarSrc("qwerty")

	expect(endpoint).toBe(
		"https://static.cdn.prismic.io/prismic.js?new=true&repo=qwerty",
	)
})

it("throws if an invalid repository name is given", () => {
	expect(() => {
		prismic.getToolbarSrc("this is invalid")
	}).toThrowError(
		/An invalid Prismic repository name was given: this is invalid/i,
	)
	expect(() => {
		prismic.getToolbarSrc("this is invalid")
	}).toThrowError(prismic.PrismicError)
})
