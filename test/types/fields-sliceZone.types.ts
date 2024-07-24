import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.SliceZone): true => {
	if (!Array.isArray(value)) {
		return expectNever(value)
	}

	switch (typeof value[0]) {
		case "object": {
			if (value[0] === null) {
				expectNever(value[0])
			}

			return true
		}

		// When the field is empty, value[0] is undefined.
		case "undefined": {
			return true
		}

		default: {
			return expectNever(value[0])
		}
	}
}

/**
 * Filled state. It does not use FieldState like other fields; an array with
 * elements implicity signals a filled state.
 */
expectType<prismic.SliceZone>([
	// Slice
	{
		id: "id",
		slice_type: "string",
		slice_label: "string",
		primary: {},
		items: [],
	},
	// Shared Slice
	{
		id: "id",
		slice_type: "string",
		slice_label: null,
		variation: "string",
		version: "string",
		primary: {},
		items: [],
	},
])

/**
 * Empty state. It does not use FieldState like other fields; an empty array
 * implicity signals an empty state.
 */
expectType<prismic.SliceZone>([])

/**
 * Supports custom Slice definitions.
 */
expectType<prismic.SliceZone<prismic.Slice<"foo">>>([
	{
		id: "id",
		slice_type: "foo",
		slice_label: "string",
		primary: {},
		items: [],
	},
])
expectType<prismic.SliceZone<prismic.Slice<"foo">>>([
	{
		id: "id",
		// @ts-expect-error - Slice must match the given type.
		slice_type: "string",
		slice_label: "string",
		primary: {},
		items: [],
	},
])

/**
 * Supports custom shared Slice definitions.
 */
expectType<prismic.SliceZone<prismic.SharedSlice<"foo">>>([
	{
		id: "id",
		slice_type: "foo",
		slice_label: null,
		variation: "string",
		version: "string",
		primary: {},
		items: [],
	},
])
expectType<prismic.SliceZone<prismic.SharedSlice<"foo">>>([
	{
		id: "id",
		// @ts-expect-error - Slice must match the given type.
		slice_type: "string",
		slice_label: null,
		variation: "string",
		version: "string",
		primary: {},
		items: [],
	},
])
