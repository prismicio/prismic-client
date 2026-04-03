import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelSharedSlice } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelSharedSlice>({
		type: "SharedSlice",
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelSharedSlice>().toExtend<Internal.SharedSliceRefModel>()
	expectTypeOf<Internal.SharedSliceRefModel>().toExtend<CustomTypeModelSharedSlice>()
})
