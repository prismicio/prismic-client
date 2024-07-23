import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelGroupField): true => {
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

expectType<prismic.CustomTypeModelGroupField>({
	type: prismic.CustomTypeModelFieldType.Group,
	config: {
		label: "string",
		fields: {
			foo: {
				type: prismic.CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
	},
})

/**
 * Does not support a placeholder.
 */
expectType<prismic.CustomTypeModelGroupField>({
	type: prismic.CustomTypeModelFieldType.Group,
	config: {
		label: "string",
		// @ts-expect-error - Does not support a placeholder.
		placeholder: "string",
		fields: {},
	},
})

/**
 * Supports custom fields.
 */
expectType<
	prismic.CustomTypeModelGroupField<{
		foo: prismic.CustomTypeModelBooleanField
	}>
>({
	type: prismic.CustomTypeModelFieldType.Group,
	config: {
		label: "string",
		fields: {
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
	},
})

/**
 * Supports nested groups.
 */
expectType<
	prismic.CustomTypeModelGroupField<{
		foo: prismic.CustomTypeModelNestedGroupField<{
			bar: prismic.CustomTypeModelBooleanField
		}>
	}>
>({
	type: prismic.CustomTypeModelFieldType.Group,
	config: {
		label: "string",
		fields: {
			foo: {
				type: prismic.CustomTypeModelFieldType.Group,
				config: {
					label: "string",
					fields: {
						bar: {
							type: prismic.CustomTypeModelFieldType.Boolean,
							config: {
								label: "string",
							},
						},
					},
				},
			},
		},
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelGroupField>({} as prismicTICustomTypes.Group)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.Group>({} as prismic.CustomTypeModelGroupField)
