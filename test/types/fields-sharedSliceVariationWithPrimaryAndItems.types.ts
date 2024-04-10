import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.SharedSliceVariationWithPrimaryAndItems): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value);
			}

			return true;
		}

		default: {
			return expectNever(value);
		}
	}
};

expectType<prismic.SharedSliceVariationWithPrimaryAndItems>({
	variation: "string",
	version: "string",
	primary: {},
	items: [],
});

/**
 * Supports custom API ID.
 */
expectType<prismic.SharedSliceVariationWithPrimaryAndItems<"foo">>({
	variation: "foo",
	version: "string",
	primary: {},
	items: [],
});
expectType<prismic.SharedSliceVariationWithPrimaryAndItems<"foo">>({
	// @ts-expect-error - Variation type must match the given type.
	variation: "string",
	version: "string",
	primary: {},
	items: [],
});

/**
 * Supports custom primary fields type.
 */
expectType<
	prismic.SharedSliceVariationWithPrimaryAndItems<
		string,
		{ foo: prismic.BooleanField }
	>
>({
	variation: "string",
	version: "string",
	primary: {
		foo: true,
		// @ts-expect-error - Only given fields are valid.
		bar: false,
	},
	items: [],
});

/**
 * Supports custom items fields type.
 */
expectType<
	prismic.SharedSliceVariationWithPrimaryAndItems<
		string,
		{ foo: prismic.BooleanField },
		{ bar: prismic.KeyTextField }
	>
>({
	variation: "string",
	version: "string",
	primary: {
		foo: true,
	},
	items: [
		{
			bar: "string",
			// @ts-expect-error - Only given fields are valid.
			baz: false,
		},
	],
});
