import { assertType, it } from "vitest"

import type { FormField } from "../../src"

it("supports String and Integer types", () => {
	assertType<FormField>({
		type: "String",
		multiple: true,
	})
	assertType<FormField>({
		type: "Integer",
		multiple: true,
	})
})

it("requires type to be String or Integer", () => {
	assertType<FormField>({
		// @ts-expect-error - `type` must be "String" or "Integer".
		type: "string",
		multiple: true,
		default: "string",
	})
})

it("supports optional default property", () => {
	assertType<FormField>({
		type: "String",
		multiple: true,
		default: "string",
	})
})
