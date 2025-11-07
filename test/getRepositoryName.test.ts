import { it } from "./it"

import { PrismicError, getRepositoryName } from "../src"

it("returns the repository name from a valid Prismic Document API endpoint", async ({
	expect,
}) => {
	const res = getRepositoryName("https://example.cdn.prismic.io/api/v2")
	expect(res).toBe("example")
})

it("throws if the input is not a Content API endpoint", async ({ expect }) => {
	expect(() => getRepositoryName("https://example.com")).toThrow(
		/invalid prismic document api endpoint/i,
	)
	expect(() => getRepositoryName("https://example.com")).toThrow(PrismicError)
})

it("throws if the input is not a valid URL", async ({ expect }) => {
	expect(() => getRepositoryName("example")).toThrow(
		/invalid prismic document api endpoint/i,
	)
	expect(() => getRepositoryName("example")).toThrow(PrismicError)
})
