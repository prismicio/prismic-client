import { expect, it } from "vitest"

import * as prismic from "../src"

it("contains the request url and optional response", () => {
	const message = "message"
	const url = "url"
	const response = { foo: "bar" } as const

	const errorWithResponse = new prismic.PrismicError(message, url, response)
	const errorWithoutResponse = new prismic.PrismicError(message, url, undefined)

	expect(errorWithResponse.message).toBe(message)
	expect(errorWithResponse.url).toBe(url)
	expect(errorWithResponse.response).toStrictEqual(response)

	expect(errorWithoutResponse.message).toBe(message)
	expect(errorWithoutResponse.url).toBe(url)
	expect(errorWithoutResponse.response).toBeUndefined()
})
