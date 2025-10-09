import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("TimestampField type structure", () => {
	expectTypeOf<prismic.TimestampField>().toEqualTypeOf<
		| `${prismic.DateField<"filled">}T${number}:${number}:${number}+${number}`
		| null
	>()
})

test("TimestampField filled state", () => {
	expectTypeOf<
		prismic.TimestampField<"filled">
	>().toEqualTypeOf<`${prismic.DateField<"filled">}T${number}:${number}:${number}+${number}`>()
})

test("TimestampField empty state", () => {
	expectTypeOf<prismic.TimestampField<"empty">>().toEqualTypeOf<null>()
})
