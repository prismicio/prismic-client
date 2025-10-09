import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("BooleanField type equals boolean", () => {
	expectTypeOf<prismic.BooleanField>().toEqualTypeOf<boolean>()
})
