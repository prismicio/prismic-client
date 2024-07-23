import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.SelectField): true => {
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
expectType<prismic.SelectField>("foo")
expectType<prismic.SelectField<string, "filled">>("foo")
expectType<prismic.SelectField<string, "empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	"foo",
)

/**
 * Empty state.
 */
expectType<prismic.SelectField>(null)
expectType<prismic.SelectField<string, "empty">>(null)
expectType<prismic.SelectField<string, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)

/**
 * Supports options enum (loosely typed using string union).
 */
;(value: prismic.SelectField<"foo" | "bar", "filled">) => {
	switch (value) {
		case "foo":
		case "bar": {
			break
		}

		default: {
			expectNever(value)
		}
	}
}
