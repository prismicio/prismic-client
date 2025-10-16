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

it("must be in YYYY-MM-DDTHH:MM:SS+ZZZZ format", () => {
	// @ts-expect-error - Arbitrary strings are invalid.
	assertType<TimestampField>("1984-01-24")
})
