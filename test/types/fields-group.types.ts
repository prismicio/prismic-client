import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.GroupField): true => {
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
expectType<prismic.GroupField>([
	{
		boolean: true,
	},
])

/**
 * Empty state. It does not use FieldState like other fields; an empty array
 * implicity signals an empty state.
 */
expectType<prismic.GroupField>([])

/**
 * Supports custom fields definition.
 */
expectType<prismic.GroupField<{ boolean: prismic.BooleanField }>>([
	{
		boolean: true,
	},
])
expectType<prismic.GroupField<{ boolean: prismic.BooleanField }>>([
	{
		// @ts-expect-error - Fields must match the given type definition.
		boolean: "string",
	},
])

/**
 * Supports nested groups.
 */
expectType<prismic.GroupField<{ group: prismic.NestedGroupField }>>([])

/**
 * Custom fields may only contain group-compatible fields.
 */
expectType<
	prismic.GroupField<// @ts-expect-error - Slice Zones are invalid within group fields.
	{
		sliceZone: prismic.SliceZone
	}>
>([])
