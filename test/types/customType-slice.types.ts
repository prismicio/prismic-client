import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelSlice): true => {
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

expectType<prismic.CustomTypeModelSlice>({
	type: prismic.CustomTypeModelSliceType.Slice,
	fieldset: "string",
	description: "string",
	icon: "string",
	display: prismic.CustomTypeModelSliceDisplay.List,
	"non-repeat": {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
	repeat: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
})

/**
 * Supports custom non-repeat fields.
 */
expectType<
	prismic.CustomTypeModelSlice<{ foo: prismic.CustomTypeModelBooleanField }>
>({
	type: prismic.CustomTypeModelSliceType.Slice,
	fieldset: "string",
	display: prismic.CustomTypeModelSliceDisplay.List,
	description: "string",
	icon: "string",
	"non-repeat": {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
		// @ts-expect-error - Only given fields are valid.
		bar: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
	repeat: {},
})

/**
 * Supports custom repeat fields.
 */
expectType<
	prismic.CustomTypeModelSlice<
		Record<string, never>,
		{ foo: prismic.CustomTypeModelBooleanField }
	>
>({
	type: prismic.CustomTypeModelSliceType.Slice,
	fieldset: "string",
	display: prismic.CustomTypeModelSliceDisplay.List,
	description: "string",
	icon: "string",
	"non-repeat": {},
	repeat: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
		// @ts-expect-error - Only given fields are valid.
		bar: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelSlice>(
	{} as prismicTICustomTypes.CompositeSlice,
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.CompositeSlice>(
	{} as prismic.CustomTypeModelSlice,
)
