import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelKeyTextField): true => {
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

expectType<prismic.CustomTypeModelKeyTextField>({
	type: prismic.CustomTypeModelFieldType.Text,
	config: {
		label: "string",
	},
})

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelKeyTextField>({
	type: prismic.CustomTypeModelFieldType.Text,
	config: {
		label: "string",
		placeholder: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelKeyTextField>({} as prismicTICustomTypes.Text)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.Text>({} as prismic.CustomTypeModelKeyTextField)
