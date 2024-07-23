import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelGeoPointField): true => {
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

expectType<prismic.CustomTypeModelGeoPointField>({
	type: prismic.CustomTypeModelFieldType.GeoPoint,
	config: {
		label: "string",
	},
})

/**
 * Does not support a placeholder.
 */
expectType<prismic.CustomTypeModelGeoPointField>({
	type: prismic.CustomTypeModelFieldType.GeoPoint,
	config: {
		label: "string",
		// @ts-expect-error - Does not support a placeholder.
		placeholder: "string",
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelGeoPointField>(
	{} as prismicTICustomTypes.GeoPoint,
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.GeoPoint>(
	{} as prismic.CustomTypeModelGeoPointField,
)
