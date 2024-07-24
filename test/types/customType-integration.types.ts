import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelIntegrationField): true => {
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

expectType<prismic.CustomTypeModelIntegrationField>({
	type: prismic.CustomTypeModelFieldType.Integration,
	config: {
		label: "string",
		catalog: "string",
	},
})

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelIntegrationField>({
	type: prismic.CustomTypeModelFieldType.Integration,
	config: {
		label: "string",
		placeholder: "string",
		catalog: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelIntegrationField>(
	{} as prismicTICustomTypes.IntegrationField,
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.IntegrationField>(
	{} as prismic.CustomTypeModelIntegrationField,
)
