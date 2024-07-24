import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelNumberField): true => {
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

expectType<prismic.CustomTypeModelNumberField>({
	type: prismic.CustomTypeModelFieldType.Number,
	config: {
		label: "string",
	},
})

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelNumberField>({
	type: prismic.CustomTypeModelFieldType.Number,
	config: {
		label: "string",
		placeholder: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelNumberField>(
	{} as prismicTICustomTypes.Number,
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.Number>(
	{} as prismic.CustomTypeModelNumberField,
)
