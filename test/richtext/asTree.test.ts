import { expect, it } from "vitest"

import { createRichTextFixtures } from "../__testutils__/createRichTextFixtures"

import { asTree } from "../../src/richtext"

it("does not mutate the provided rich text field", () => {
	const richTextFixturesUntouched = createRichTextFixtures()
	const richTextFixturesMaybeMutated = createRichTextFixtures()

	// We run it twice to ensure successive runs does not mutate the value.
	asTree(richTextFixturesMaybeMutated.en)
	asTree(richTextFixturesMaybeMutated.en)

	expect(richTextFixturesUntouched.en).toStrictEqual(
		richTextFixturesMaybeMutated.en,
	)
})

it("converts a rich text field value to a tree", () => {
	const richTextFixtures = createRichTextFixtures()

	expect(asTree(richTextFixtures.en)).toMatchSnapshot()
})
