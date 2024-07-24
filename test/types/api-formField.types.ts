import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.FormField): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

expectType<prismic.FormField>({
	type: "String",
	multiple: true,
	default: "string",
})
expectType<prismic.FormField>({
	type: "Integer",
	multiple: true,
	default: "string",
})

/**
 * `type` must be "String" or "Integer".
 */
expectType<prismic.FormField>({
	// @ts-expect-error - `type` must be "String" or "Integer".
	type: "string",
	multiple: true,
	default: "string",
})

/**
 * Supports optional `default` property.
 */
expectType<prismic.FormField>({
	type: "String",
	multiple: true,
})
