import { assertType, it } from "vitest"

import type { KeyTextField } from "../../src"

it("supports filled values", () => {
	assertType<KeyTextField>("foo")
	assertType<KeyTextField<"filled">>("foo")
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<KeyTextField<"filled">>(null)
})

it("supports empty values", () => {
	assertType<KeyTextField>(null)
	assertType<KeyTextField<"empty">>(null)
	assertType<KeyTextField<"empty">>(
		// @ts-expect-error - Empty fields cannot contain a filled value.
		"foo",
	)
})
