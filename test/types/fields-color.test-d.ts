import { assertType, it } from "vitest"

import type { ColorField } from "../../src"

it("supports filled values", () => {
	assertType<ColorField>("#FF00FF")
	assertType<ColorField<"filled">>("#FF00FF")
	// @ts-expect-error - An empty value is invalud
	assertType<ColorField<"filled">>(null)
})

it("supports empty values", () => {
	assertType<ColorField>(null)
	assertType<ColorField<"empty">>(null)
	// @ts-expect-error - A filled value is invalud
	assertType<ColorField<"empty">>("#FF00FF")
})

it("must be in hex triplet format", () => {
	// @ts-expect-error - Invalid value
	assertType<ColorField>("yellow")
	// @ts-expect-error - Invalid value
	assertType<ColorField>("rgb(255, 0, 255)")
})
