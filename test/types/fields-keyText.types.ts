import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.KeyTextField): true => {
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
expectType<prismic.KeyTextField>("foo")
expectType<prismic.KeyTextField<"filled">>("foo")
expectType<prismic.KeyTextField<"empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	"foo",
)

/**
 * Empty state.
 */
expectType<prismic.KeyTextField>(null)
expectType<prismic.KeyTextField<"empty">>(null)
expectType<prismic.KeyTextField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)
