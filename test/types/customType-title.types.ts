import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelTitleField): true => {
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

expectType<prismic.CustomTypeModelTitleField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		single: "string",
	},
})

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelTitleField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		placeholder: "string",
		single: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelTitleField>(
	{} as prismicTICustomTypes.RichText,
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.RichText>(
	{} as prismic.CustomTypeModelTitleField,
)
