import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.SharedSliceVariation): true => {
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

expectType<prismic.SharedSliceVariation>({
	variation: "string",
	version: "string",
	primary: {},
	items: [],
})

/**
 * Supports custom API ID.
 */
expectType<prismic.SharedSliceVariation<"foo">>({
	variation: "foo",
	version: "string",
	primary: {},
	items: [],
})
expectType<prismic.SharedSliceVariation<"foo">>({
	// @ts-expect-error - Variation type must match the given type.
	variation: "string",
	version: "string",
	primary: {},
	items: [],
})

/**
 * Supports custom primary fields type.
 */
expectType<
	prismic.SharedSliceVariation<
		string,
		{ foo: prismic.BooleanField; bar: prismic.GroupField }
	>
>({
	variation: "string",
	version: "string",
	primary: {
		foo: true,
		bar: [],
		// @ts-expect-error - Only given fields are valid.
		baz: false,
	},
	items: [],
})

/**
 * Supports custom items fields type.
 */
expectType<
	prismic.SharedSliceVariation<
		string,
		Record<never, never>,
		{ bar: prismic.KeyTextField }
	>
>({
	variation: "string",
	version: "string",
	primary: {},
	items: [
		{
			bar: "string",
			// @ts-expect-error - Only given fields are valid.
			baz: false,
		},
	],
})

/**
 * Does not support groups in items section.
 */
expectType<
	prismic.SharedSliceVariation<
		string,
		Record<never, never>,
		// @ts-expect-error - Group fields are not supported.
		{ foo: prismic.GroupField }
	>
>({
	variation: "string",
	version: "string",
	primary: {},
	items: [],
})
