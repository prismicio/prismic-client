import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelEmbedField): true => {
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

expectType<prismic.CustomTypeModelEmbedField>({
	type: prismic.CustomTypeModelFieldType.Embed,
	config: {
		label: "string",
	},
})

/**
 * Supports optional placeholder
 */
expectType<prismic.CustomTypeModelEmbedField>({
	type: prismic.CustomTypeModelFieldType.Embed,
	config: {
		label: "string",
		placeholder: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelEmbedField>({} as prismicTICustomTypes.Embed)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.Embed>({} as prismic.CustomTypeModelEmbedField)
