import { expect, it } from "vitest"

import * as prismic from "../src/index.ts"

it("returns true if the input is a repository name", () => {
	expect(prismic.isRepositoryName("qwerty")).toBe(true)
})

it("returns false if the input is not a repository name", () => {
	expect(prismic.isRepositoryName("https://qwerty.cdn.prismic.io/api/v2")).toBe(
		false,
	)
	expect(prismic.isRepositoryName("this is invalid")).toBe(false)
})
