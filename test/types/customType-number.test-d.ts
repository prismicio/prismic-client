import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelNumberField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelNumberField>({
		type: "Number",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelNumberField>({
		type: "Number",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelNumberField>().toExtend<Internal.NumberModel>()
	expectTypeOf<Internal.NumberModel>().toExtend<CustomTypeModelNumberField>()
})
