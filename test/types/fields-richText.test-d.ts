import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("RichTextField type structure", () => {
	expectTypeOf<prismic.RichTextField>().toEqualTypeOf<
		| []
		| [prismic.RTNode, ...prismic.RTNode[]]
	>()
})

test("RichTextField filled state", () => {
	expectTypeOf<prismic.RichTextField<"filled">>().toEqualTypeOf<
		[prismic.RTNode, ...prismic.RTNode[]]
	>()
})

test("RichTextField empty state", () => {
	expectTypeOf<prismic.RichTextField<"empty">>().toEqualTypeOf<[]>()
})
