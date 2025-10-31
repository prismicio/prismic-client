import { assertType, expectTypeOf, it } from "vitest"

import type { Text } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelKeyTextField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelKeyTextField>({
		type: "Text",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelKeyTextField>({
		type: "Text",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelKeyTextField>().toExtend<Text>()
	expectTypeOf<Text>().toExtend<CustomTypeModelKeyTextField>()
})
