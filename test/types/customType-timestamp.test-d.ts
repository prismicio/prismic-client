import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelTimestampField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelTimestampField>({
		type: "Timestamp",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelTimestampField>({
		type: "Timestamp",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelTimestampField>().toExtend<Internal.TimestampModel>()
	expectTypeOf<Internal.TimestampModel>().toExtend<CustomTypeModelTimestampField>()
})
