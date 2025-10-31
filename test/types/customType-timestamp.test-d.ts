import { assertType, expectTypeOf, it } from "vitest"

import type { Timestamp } from "@prismicio/types-internal/lib/customtypes"

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
	expectTypeOf<CustomTypeModelTimestampField>().toExtend<Timestamp>()
	expectTypeOf<Timestamp>().toExtend<CustomTypeModelTimestampField>()
})
