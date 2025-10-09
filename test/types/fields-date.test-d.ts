import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("DateField type structure", () => {
	expectTypeOf<prismic.DateField>().toEqualTypeOf<
		`${number}-${number}-${number}` | null
	>()
})

test("DateField filled state", () => {
	expectTypeOf<
		prismic.DateField<"filled">
	>().toEqualTypeOf<`${number}-${number}-${number}`>()
})

test("DateField empty state", () => {
	expectTypeOf<prismic.DateField<"empty">>().toEqualTypeOf<null>()
})
