import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.GeoPointField): true => {
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

/**
 * Filled state.
 */
expectType<prismic.GeoPointField>({
	longitude: 0,
	latitude: 0,
})
expectType<prismic.GeoPointField<"filled">>({
	longitude: 0,
	latitude: 0,
})
expectType<prismic.GeoPointField<"empty">>({
	// @ts-expect-error - Empty fields cannot contain a filled value.
	longitude: 0,
	// @ts-expect-error - Empty fields cannot contain a filled value.
	latitude: 0,
})

/**
 * Empty state.
 */
expectType<prismic.GeoPointField>({})
expectType<prismic.GeoPointField<"empty">>({})
expectType<prismic.GeoPointField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{},
)
