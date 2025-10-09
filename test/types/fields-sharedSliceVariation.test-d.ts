import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("SharedSliceVariation type structure", () => {
	expectTypeOf<prismic.SharedSliceVariation>().toEqualTypeOf<{
		variation: string
		version: string
		primary: Record<string, prismic.AnySlicePrimaryField>
		items: Record<string, prismic.AnyRegularField>[]
	}>()
})
