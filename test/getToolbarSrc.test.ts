import { it } from "./it"

import { PrismicError, getToolbarSrc } from "../src"

it("returns a URL for the Prismic Toolbar script", async ({ expect }) => {
	const res = getToolbarSrc("example")
	expect(res).toBe(
		"https://static.cdn.prismic.io/prismic.js?new=true&repo=example",
	)
})

it("throws if an invalid repository name is given", async ({ expect }) => {
	expect(() => getToolbarSrc("this is invalid")).toThrow(
		/invalid prismic repository name/i,
	)
	expect(() => getToolbarSrc("this is invalid")).toThrow(PrismicError)
})
