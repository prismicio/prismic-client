import { expect, it } from "vitest"

import { richTextFixture } from "./__fixtures__/richText"

import { asText } from "../src"
import { asText as richTextAsText } from "../src/richtext"

it("is an alias for @prismicio/client/richtext's `asText` function for non-nullish inputs", () => {
	expect(asText(richTextFixture.en)).toBe(richTextAsText(richTextFixture.en))
})

it("returns null for nullish inputs", () => {
	expect(asText(null)).toBeNull()
	expect(asText(undefined)).toBeNull()
})

it("supports separator configuration", () => {
	expect(asText(richTextFixture.en, { separator: "__separator__" })).toBe(
		richTextAsText(richTextFixture.en, "__separator__"),
	)

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(asText(richTextFixture.en, "__separator__")).toBe(
		richTextAsText(richTextFixture.en, "__separator__"),
	)
})
