import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("TitleField type structure", () => {
	expectTypeOf<prismic.TitleField>().toEqualTypeOf<
		| []
		| [
				Omit<
					| prismic.RTHeading1Node
					| prismic.RTHeading2Node
					| prismic.RTHeading3Node
					| prismic.RTHeading4Node
					| prismic.RTHeading5Node
					| prismic.RTHeading6Node,
					"spans"
				> & {
					spans: []
				},
		  ]
	>()
})

test("TitleField filled state", () => {
	expectTypeOf<prismic.TitleField<"filled">>().toEqualTypeOf<
		[
			Omit<
				| prismic.RTHeading1Node
				| prismic.RTHeading2Node
				| prismic.RTHeading3Node
				| prismic.RTHeading4Node
				| prismic.RTHeading5Node
				| prismic.RTHeading6Node,
				"spans"
			> & {
				spans: []
			},
		]
	>()
})

test("TitleField empty state", () => {
	expectTypeOf<prismic.TitleField<"empty">>().toEqualTypeOf<[]>()
})
