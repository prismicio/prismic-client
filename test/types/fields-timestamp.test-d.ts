import { assertType, it } from "vitest"

import type { TimestampField } from "../../src"

it("supports filled values", () => {
	assertType<TimestampField>("1984-01-24T05:00:00+0000")
	assertType<TimestampField<"filled">>("1984-01-24T05:00:00+0000")
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<TimestampField<"filled">>(null)
})

it("supports empty values", () => {
	assertType<TimestampField>(null)
	assertType<TimestampField<"empty">>(null)
	// @ts-expect-error - Empty fields cannot contain a filled value.
	assertType<TimestampField<"empty">>("1984-01-24T05:00:00+0000")
})
