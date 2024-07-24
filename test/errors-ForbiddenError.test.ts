import { expect, it } from "vitest"

import * as prismic from "../src"

it("contains the request url and error properties", () => {
	const message = "message"
	const url = "url"
	const response = {
		error: "error",
		oauth_initiate: "oauth_initiate",
		oauth_token: "oauth_token",
	} as const
	const error = new prismic.ForbiddenError(message, url, response)

	expect(error.message).toBe(message)
	expect(error.url).toBe(url)
	expect(error.response).toStrictEqual(response)
})
