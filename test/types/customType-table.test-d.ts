import { assertType, expectTypeOf, it } from "vitest"

import type { Table } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelTableField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelTableField>({
		type: "Table",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelTableField>({
		type: "Table",
		config: {
			label: "string",
		},
	})
})

it("does not support a placeholder", () => {
	assertType<CustomTypeModelTableField>({
		type: "Table",
		config: {
			// @ts-expect-error - Does not support a placeholder.
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelTableField>().toExtend<Table>()
	expectTypeOf<Table>().toExtend<CustomTypeModelTableField>()
})
