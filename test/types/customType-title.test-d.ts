import { assertType, expectTypeOf, it } from "vitest"

import type { RichText } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelTitleField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelTitleField>({
		type: "StructuredText",
		config: {
			label: "string",
			single: "string",
		},
	})
})

it("supports config", () => {
	assertType<CustomTypeModelTitleField>({
		type: "StructuredText",
		config: {
			label: "string",
			placeholder: "string",
			single: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelTitleField>().toExtend<RichText>()
	expectTypeOf<RichText>().toExtend<CustomTypeModelTitleField>()
})
