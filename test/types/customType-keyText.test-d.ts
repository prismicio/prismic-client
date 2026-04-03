import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

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
	expectTypeOf<CustomTypeModelKeyTextField>().toExtend<Internal.TextModel>()
	expectTypeOf<Internal.TextModel>().toExtend<CustomTypeModelKeyTextField>()
})
