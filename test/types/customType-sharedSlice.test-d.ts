import { assertType, expectTypeOf, it } from "vitest"

import type { SharedSliceRef } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelSharedSlice } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelSharedSlice>({
		type: "SharedSlice",
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelSharedSlice>().toExtend<SharedSliceRef>()
	expectTypeOf<SharedSliceRef>().toExtend<CustomTypeModelSharedSlice>()
})
