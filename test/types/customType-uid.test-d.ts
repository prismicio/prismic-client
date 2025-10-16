import { assertType, expectTypeOf, it } from "vitest"

import type { UID } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelUIDField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelUIDField>({
		type: "UID",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelUIDField>({
		type: "UID",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelUIDField>().toExtend<UID>()
	expectTypeOf<UID>().toExtend<CustomTypeModelUIDField>()
})
