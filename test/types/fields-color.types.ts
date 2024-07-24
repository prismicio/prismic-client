import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.ColorField): true => {
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
expectType<prismic.ColorField>("#FF00FF")
expectType<prismic.ColorField<"filled">>("#FF00FF")
expectType<prismic.ColorField<"empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	"#FF00FF",
)

/**
 * Empty state.
 */
expectType<prismic.ColorField>(null)
expectType<prismic.ColorField<"empty">>(null)
expectType<prismic.ColorField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)

/**
 * Must be in hex triplet format.
 */
expectType<prismic.ColorField>(
	// @ts-expect-error - Arbitrary strings are invalid.
	"yellow",
)
expectType<prismic.ColorField>(
	// @ts-expect-error - Non-hex-triplet color formats are invalid.
	"rgb(255, 0, 255)",
)
