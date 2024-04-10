import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.SharedSliceVariationWithData): true => {
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

expectType<prismic.SharedSliceVariationWithData>({
	variation: "string",
	version: "string",
	data: {},
});

/**
 * Supports custom API ID.
 */
expectType<prismic.SharedSliceVariationWithData<"foo">>({
	variation: "foo",
	version: "string",
	data: {},
});
expectType<prismic.SharedSliceVariationWithData<"foo">>({
	// @ts-expect-error - Variation type must match the given type.
	variation: "string",
	version: "string",
	data: {},
});

/**
 * Supports custom data type.
 */
expectType<
	prismic.SharedSliceVariationWithData<string, { foo: prismic.BooleanField }>
>({
	variation: "string",
	version: "string",
	data: {
		foo: true,
		// @ts-expect-error - Only given fields are valid.
		bar: false,
	},
	items: [],
});
