import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.IntegrationField): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				return true
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

/**
 * Filled state.
 */
expectType<prismic.IntegrationField>({
	foo: "bar",
})
expectType<prismic.IntegrationField<Record<string, unknown>, "filled">>({
	foo: "bar",
})
expectType<prismic.IntegrationField<Record<string, unknown>, "empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	{
		foo: "bar",
	},
)

/**
 * Empty state.
 */
expectType<prismic.IntegrationField>(null)
expectType<prismic.IntegrationField<Record<string, unknown>, "empty">>(null)
expectType<prismic.IntegrationField<Record<string, unknown>, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)

/**
 * Supports custom blob type.
 */
expectType<prismic.IntegrationField<{ foo: "bar" }>>({
	foo: "bar",
})
expectType<prismic.IntegrationField<{ foo: "bar" }>>({
	// @ts-expect-error - Blob should match the given type.
	baz: "qux",
})
