import { it } from "./it"

import { isRepositoryEndpoint } from "../src"

it("returns true if the input is a valid url", async ({ expect }) => {
	const res = isRepositoryEndpoint("https://example.com/endpoint")
	expect(res).toBe(true)
})

it("returns false if the input is an invalid url", async ({ expect }) => {
	const res = isRepositoryEndpoint("qwerty")
	expect(res).toBe(false)
})
