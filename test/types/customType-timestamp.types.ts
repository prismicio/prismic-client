import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelTimestampField): true => {
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

expectType<prismic.CustomTypeModelTimestampField>({
	type: prismic.CustomTypeModelFieldType.Timestamp,
	config: {
		label: "string",
	},
})

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelTimestampField>({
	type: prismic.CustomTypeModelFieldType.Timestamp,
	config: {
		label: "string",
		placeholder: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelTimestampField>(
	{} as prismicTICustomTypes.Timestamp,
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.Timestamp>(
	{} as prismic.CustomTypeModelTimestampField,
)
