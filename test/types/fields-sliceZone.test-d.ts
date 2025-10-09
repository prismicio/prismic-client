import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

type DefaultSlices = prismic.Slice | prismic.SharedSlice

test("SliceZone type structure", () => {
	expectTypeOf<prismic.SliceZone>().toEqualTypeOf<
		| []
		| [DefaultSlices, ...DefaultSlices[]]
	>()
})

test("SliceZone filled state", () => {
	expectTypeOf<
		prismic.SliceZone<DefaultSlices, "filled">
	>().toEqualTypeOf<[DefaultSlices, ...DefaultSlices[]]>()
})

test("SliceZone empty state", () => {
	expectTypeOf<prismic.SliceZone<DefaultSlices, "empty">>().toEqualTypeOf<[]>()
})
