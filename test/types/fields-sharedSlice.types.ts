import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.SharedSlice): true => {
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

expectType<prismic.SharedSlice>({
	slice_type: "string",
	slice_label: null,
	variation: "string",
	version: "string",
	primary: {},
	items: [],
});

/**
 * Supports custom shared Slice type API ID.
 */
expectType<prismic.SharedSlice<"foo">>({
	slice_type: "foo",
	slice_label: null,
	variation: "string",
	version: "string",
	primary: {},
	items: [],
});
expectType<prismic.SharedSlice<"foo">>({
	// @ts-expect-error - Slice type must match the given type.
	slice_type: "string",
	slice_label: null,
	variation: "string",
	version: "string",
	primary: {},
	items: [],
});

/**
 * Supports custom variation types.
 */
expectType<prismic.SharedSlice<string, prismic.SharedSliceVariation<"foo">>>({
	slice_type: "string",
	slice_label: null,
	variation: "foo",
	version: "string",
	primary: {},
	items: [],
});
expectType<prismic.SharedSlice<string, prismic.SharedSliceVariation<"foo">>>({
	slice_type: "string",
	slice_label: null,
	// @ts-expect-error - Variation type must match the given type.
	variation: "string",
	version: "string",
	primary: {},
	items: [],
});
