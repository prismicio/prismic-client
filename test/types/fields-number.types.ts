import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.NumberField): true => {
	switch (typeof value) {
		case "number": {
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
expectType<prismic.NumberField>(0)
expectType<prismic.NumberField<"filled">>(0)
expectType<prismic.NumberField<"empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	0,
)

/**
 * Empty state.
 */
expectType<prismic.NumberField>(null)
expectType<prismic.NumberField<"empty">>(null)
expectType<prismic.NumberField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)
