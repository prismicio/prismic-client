import { assertType, it } from "vitest"

import type { NumberField } from "../../src"

it("supports filled values", () => {
	assertType<NumberField>(0)
	assertType<NumberField<"filled">>(0)
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<NumberField<"filled">>(null)
})

it("supports empty values", () => {
	assertType<NumberField>(null)
	assertType<NumberField<"empty">>(null)
	// @ts-expect-error - Empty fields cannot contain a filled value.
	assertType<NumberField<"empty">>(0)
})
