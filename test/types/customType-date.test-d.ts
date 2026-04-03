import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelDateField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelDateField>({
		type: "Date",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelDateField>({
		type: "Date",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelDateField>().toExtend<Internal.DateModel>()
	expectTypeOf<Internal.DateModel>().toExtend<CustomTypeModelDateField>()
})
