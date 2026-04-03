import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelColorField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelColorField>({
		type: "Color",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelColorField>({
		type: "Color",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelColorField>().toExtend<Internal.ColorModel>()
	expectTypeOf<Internal.ColorModel>().toExtend<CustomTypeModelColorField>()
})
