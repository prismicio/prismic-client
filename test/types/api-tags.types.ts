import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.Tags): true => {
	if (!Array.isArray(value)) {
		return expectNever(value)
	}

	switch (typeof value[0]) {
		case "string": {
			return true
		}

		default: {
			return expectNever(value[0])
		}
	}
}

expectType<prismic.Tags>(["string"])

/**
 * Supports empty lists.
 */
expectType<prismic.Tags>([])

/**
 * Supports custom tag enum-like (string union).
 */
expectType<prismic.Tags<"foo" | "bar">>(["foo", "bar"])
expectType<prismic.Tags<"foo" | "bar">>([
	// @ts-expect-error - Only given tags are valid.
	"string",
])
