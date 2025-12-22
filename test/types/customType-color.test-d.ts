import { assertType, expectTypeOf, it } from "vitest"

import type { Color } from "@prismicio/types-internal/lib/customtypes"

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
	expectTypeOf<CustomTypeModelColorField>().toExtend<Color>()
	expectTypeOf<Color>().toExtend<CustomTypeModelColorField>()
})
