import { expect, it } from "vitest"

import * as prismic from "../src"

it("contains the request url and error properties", () => {
	const message = "message"
	const url = "url"
	const response = {
		type: "parsing-error",
		message: "message",
		location: "location",
		line: 0,
		column: 0,
		id: 0,
	} as const
	const error = new prismic.ParsingError(message, url, response)

	expect(error.message).toBe(message)
	expect(error.url).toBe(url)
	expect(error.response).toStrictEqual(response)
})
