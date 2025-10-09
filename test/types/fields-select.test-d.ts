import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("SelectField type structure", () => {
	expectTypeOf<prismic.SelectField>().toEqualTypeOf<string | null>()
})

test("SelectField filled state", () => {
	expectTypeOf<prismic.SelectField<string, "filled">>().toEqualTypeOf<string>()
})

test("SelectField empty state", () => {
	expectTypeOf<prismic.SelectField<string, "empty">>().toEqualTypeOf<null>()
})
