import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns true if the input is a repository endpoint", () => {
	expect(
		prismic.isRepositoryEndpoint("https://qwerty.cdn.prismic.io/api/v2"),
	).toBe(true)
	expect(
		prismic.isRepositoryEndpoint("https://example.com"),
		"Any valid URL is a valid Prismic repository endpoint to support network proxies.",
	).toBe(true)
})

it("returns false if the input is not a repository endpoint", () => {
	expect(prismic.isRepositoryEndpoint("qwerty")).toBe(false)
	expect(
		prismic.isRepositoryEndpoint(
			"https://this is invalid.cdn.prismic.io/api/v2",
		),
	).toBe(false)
})
