import { assertType, expectTypeOf, it } from "vitest"

import type { Date } from "@prismicio/types-internal/lib/customtypes"

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
	expectTypeOf<CustomTypeModelDateField>().toExtend<Date>()
	expectTypeOf<Date>().toExtend<CustomTypeModelDateField>()
})
