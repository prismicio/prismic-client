import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("NumberField type structure", () => {
	expectTypeOf<prismic.NumberField>().toEqualTypeOf<number | null>()
})

test("NumberField filled state", () => {
	expectTypeOf<prismic.NumberField<"filled">>().toEqualTypeOf<number>()
})

test("NumberField empty state", () => {
	expectTypeOf<prismic.NumberField<"empty">>().toEqualTypeOf<null>()
})
