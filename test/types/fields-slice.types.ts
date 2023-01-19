import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.Slice): true => {
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

expectType<prismic.Slice>({
	slice_type: "string",
	slice_label: null,
	primary: {},
	items: [],
});

/**
 * Supports Slice labels.
 */
expectType<prismic.Slice>({
	slice_type: "string",
	slice_label: "string",
	primary: {},
	items: [],
});

/**
 * Supports custom Slice type API ID.
 */
expectType<prismic.Slice<"foo">>({
	slice_type: "foo",
	slice_label: "string",
	primary: {},
	items: [],
});
expectType<prismic.Slice<"foo">>({
	// @ts-expect-error - Slice type must match the given type.
	slice_type: "string",
	slice_label: "string",
	primary: {},
	items: [],
});

/**
 * Supports custom primary fields type.
 */
expectType<prismic.Slice<string, { foo: prismic.BooleanField }>>({
	slice_type: "string",
	slice_label: "string",
	primary: {
		foo: true,
		// @ts-expect-error - Only given fields are valid.
		bar: false,
	},
	items: [],
});

/**
 * Custom primary fields may only contain group-compatible fields.
 */
expectType<
	prismic.Slice<
		string,
		// @ts-expect-error - Groups are invalid within primary fields.
		{
			group: prismic.GroupField;
		}
	>
>({
	slice_type: "string",
	slice_label: "string",
	primary: {
		group: [],
	},
	items: [],
});
expectType<
	prismic.Slice<
		string,
		// @ts-expect-error - Slice Zones are invalid within primary fields.
		{
			sliceZone: prismic.SliceZone;
		}
	>
>({
	slice_type: "string",
	slice_label: "string",
	primary: {
		sliceZone: [],
	},
	items: [],
});

/**
 * Supports custom items fields type.
 */
expectType<
	prismic.Slice<
		string,
		{ foo: prismic.BooleanField },
		{ bar: prismic.KeyTextField }
	>
>({
	slice_type: "string",
	slice_label: "string",
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

/**
 * Custom item fields may only contain group-compatible fields.
 */
expectType<
	prismic.Slice<
		string,
		{ foo: prismic.BooleanField },
		// @ts-expect-error - Groups are invalid within item fields.
		{
			group: prismic.GroupField;
		}
	>
>({
	slice_type: "string",
	slice_label: "string",
	primary: {
		foo: true,
	},
	items: [],
});
expectType<
	prismic.Slice<
		string,
		{ foo: prismic.BooleanField },
		// @ts-expect-error - Slice Zones are invalid within item fields.
		{
			sliceZone: prismic.SliceZone;
		}
	>
>({
	slice_type: "string",
	slice_label: "string",
	primary: {
		foo: true,
	},
	items: [],
});
