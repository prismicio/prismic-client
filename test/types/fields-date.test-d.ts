import { assertType, it } from "vitest"

import type { DateField } from "../../src"

it("supports filled values", () => {
	assertType<DateField>("1984-01-24")
	assertType<DateField<"filled">>("1984-01-24")
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<DateField<"filled">>(null)
})

it("supports empty values", () => {
	assertType<DateField>(null)
	assertType<DateField<"empty">>(null)
	// @ts-expect-error - Empty fields cannot contain a filled value.
	assertType<DateField<"empty">>("1984-01-24")
})
