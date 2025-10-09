import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("SharedSlice type structure", () => {
	expectTypeOf<prismic.SharedSlice>().toEqualTypeOf<
		{
			slice_type: string
			slice_label: null
			id: string
		} & prismic.SharedSliceVariation
	>()
})
