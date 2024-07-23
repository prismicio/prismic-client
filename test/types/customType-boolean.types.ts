import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelBooleanField): true => {
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

expectType<prismic.CustomTypeModelBooleanField>({
	type: prismic.CustomTypeModelFieldType.Boolean,
	config: {
		label: "string",
	},
})

/**
 * Does not support a placeholder.
 */
expectType<prismic.CustomTypeModelBooleanField>({
	type: prismic.CustomTypeModelFieldType.Boolean,
	config: {
		label: "string",
		// @ts-expect-error - Does not support a placeholder.
		placeholder: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelBooleanField>(
	{} as prismicTICustomTypes.BooleanField,
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.BooleanField>(
	{} as prismic.CustomTypeModelBooleanField,
)
