import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("ImageField type structure", () => {
	expectTypeOf<prismic.ImageField>().toEqualTypeOf<
		| prismic.ImageFieldImage<"filled">
		| prismic.ImageFieldImage<"empty">
	>()
})

test("ImageField filled state", () => {
	expectTypeOf<prismic.ImageField<never, "filled">>().toEqualTypeOf<
		prismic.ImageFieldImage<"filled">
	>()
})

test("ImageField empty state", () => {
	expectTypeOf<prismic.ImageField<never, "empty">>().toEqualTypeOf<
		prismic.ImageFieldImage<"empty">
	>()
})
