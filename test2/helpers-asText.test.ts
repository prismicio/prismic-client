import { it } from "./it"

import type { RichTextField } from "../src"
import { asText } from "../src"

const field: RichTextField = [
	{
		type: "paragraph",
		text: "foo bar",
		spans: [{ start: 4, end: 7, type: "strong" }],
	},
	{
		type: "paragraph",
		text: "baz",
		spans: [],
	},
]

it("converts rich text to text", async ({ expect }) => {
	const res = asText(field)
	expect(res).toBe("foo bar baz")
})

it("supports separator configuration", async ({ expect }) => {
	const res = asText(field, { separator: "__separator__" })
	expect(res).toBe("foo bar__separator__baz")
})

it("returns null for null input", async ({ expect }) => {
	expect(asText(null)).toBeNull()
})

it("returns null for undefined input", async ({ expect }) => {
	expect(asText(undefined)).toBeNull()
})
