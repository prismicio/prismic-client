import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelBooleanField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelBooleanField>({
		type: "Boolean",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelBooleanField>({
		type: "Boolean",
		config: {
			label: "string",
		},
	})
})

it("does not support a placeholder", () => {
	assertType<CustomTypeModelBooleanField>({
		type: "Boolean",
		config: {
			// @ts-expect-error - Does not support a placeholder.
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelBooleanField>().toExtend<Internal.BooleanModel>()
	expectTypeOf<Internal.BooleanModel>().toExtend<CustomTypeModelBooleanField>()
})
