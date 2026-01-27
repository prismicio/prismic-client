import { it } from "./it"

import { PrismicError, getRepositoryName } from "../src"

it("returns the repository name from a valid Prismic Document API endpoint", async ({
	expect,
}) => {
	expect(getRepositoryName("https://example.cdn.prismic.io/api/v2")).toBe("example")
	expect(getRepositoryName("https://example.cdn.wroom.io/api/v2")).toBe("example")
	expect(getRepositoryName("https://example.cdn.dev-tools-wroom.com/api/v2")).toBe("example")
	expect(getRepositoryName("https://example.cdn.marketing-tools-wroom.com/api/v2")).toBe("example")
	expect(getRepositoryName("https://example.cdn.platform-wroom.com/api/v2")).toBe("example")
	expect(getRepositoryName("https://example.cdn.wroom.test/api/v2")).toBe("example")
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
