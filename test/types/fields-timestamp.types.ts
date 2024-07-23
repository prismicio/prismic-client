import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.TimestampField): true => {
	switch (typeof value) {
		case "string": {
			return true
		}

		default: {
			if (value === null) {
				return true
			}

			return expectNever(value)
		}
	}
}

/**
 * Filled state.
 */
expectType<prismic.TimestampField>("1984-01-24T05:00:00+0000")
expectType<prismic.TimestampField<"filled">>("1984-01-24T05:00:00+0000")
expectType<prismic.TimestampField<"empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	"1984-01-24T05:00:00+0000",
)

/**
 * Empty state.
 */
expectType<prismic.TimestampField>(null)
expectType<prismic.TimestampField<"empty">>(null)
expectType<prismic.TimestampField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)

/**
 * Must be in YYYY-MM-DDTHH:MM:SS+ZZZZ format.
 */
expectType<prismic.TimestampField>(
	// @ts-expect-error - Arbitrary strings are invalid.
	"1984-01-24",
)
