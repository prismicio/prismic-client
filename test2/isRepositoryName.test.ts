import { it } from "./it"

import { isRepositoryName } from "../src"

it("returns true if the input is a repository name", async ({ expect }) => {
	const res = isRepositoryName("example")
	expect(res).toBe(true)
})

it("returns false if the input is not a repository name", async ({
	expect,
}) => {
	const res1 = isRepositoryName("https://example.cdn.prismic.io/api/v2")
	expect(res1).toBe(false)
	const res2 = isRepositoryName("this is invalid")
	expect(res2).toBe(false)
})
