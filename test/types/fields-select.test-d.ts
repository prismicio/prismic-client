import { assertType, it } from "vitest"

import type { SelectField } from "../../src"

it("supports filled values", () => {
	assertType<SelectField>("foo")
	assertType<SelectField<string, "filled">>("foo")
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<SelectField<string, "filled">>(null)
})

it("supports empty values", () => {
	assertType<SelectField>(null)
	assertType<SelectField<string, "empty">>(null)
	// @ts-expect-error - Empty fields cannot contain a filled value.
	assertType<SelectField<string, "empty">>("foo")
})

it("supports options enum", () => {
	assertType<SelectField<"foo" | "bar", "filled">>("foo")
	assertType<SelectField<"foo" | "bar", "filled">>("bar")
	// @ts-expect-error - Value must match the given options.
	assertType<SelectField<"foo" | "bar", "filled">>("baz")
})
