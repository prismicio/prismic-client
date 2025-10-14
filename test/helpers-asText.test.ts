import { expect, it } from "vitest"

import { createRichTextFixtures } from "./__testutils__/createRichTextFixtures.ts"

import { asText } from "../src/index.ts"
import { asText as richTextAsText } from "../src/richtext.ts"

it("is an alias for @prismicio/client/richtext's `asText` function for non-nullish inputs", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(asText(richTextFixtures.en)).toBe(richTextAsText(richTextFixtures.en))
})

it("returns null for nullish inputs", () => {
	expect(asText(null)).toBeNull()
	expect(asText(undefined)).toBeNull()
})

it("supports separator configuration", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(asText(richTextFixtures.en, { separator: "__separator__" })).toBe(
		richTextAsText(richTextFixtures.en, "__separator__"),
	)

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(asText(richTextFixtures.en, "__separator__")).toBe(
		richTextAsText(richTextFixtures.en, "__separator__"),
	)
})
