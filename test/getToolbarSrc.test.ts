import { PrismicError, getToolbarSrc } from "../src"
import { it } from "./it"

it("returns the default URL for the Prismic Toolbar script", async ({ expect }) => {
	const res = getToolbarSrc("example")
	expect(res).toBe("https://static.cdn.prismic.io/prismic.js?repo=example")
})

it("returns a URL for the Prismic Toolbar v5 script with version 5", async ({ expect }) => {
	const res = getToolbarSrc("example", { version: 5 })
	expect(res).toBe("https://static.cdn.prismic.io/prismic.js?repo=example&v=5")
})

it("throws if an invalid repository name is given", async ({ expect }) => {
	expect(() => getToolbarSrc("this is invalid")).toThrow(/invalid prismic repository name/i)
	expect(() => getToolbarSrc("this is invalid")).toThrow(PrismicError)
})
