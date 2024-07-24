import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.DateField): true => {
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
expectType<prismic.DateField>("1984-01-24")
expectType<prismic.DateField<"filled">>("1984-01-24")
expectType<prismic.DateField<"empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	"1984-01-24",
)

/**
 * Empty state.
 */
expectType<prismic.DateField>(null)
expectType<prismic.DateField<"empty">>(null)
expectType<prismic.DateField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)

/**
 * Must be in YYYY-MM-DD format.
 */
expectType<prismic.DateField>(
	// @ts-expect-error - Arbitrary strings are invalid.
	"Jan 24, 1984",
)
