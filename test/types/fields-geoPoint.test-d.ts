import { assertType, it } from "vitest"

import type { GeoPointField } from "../../src"

it("supports filled values", () => {
	assertType<GeoPointField>({
		longitude: 0,
		latitude: 0,
	})
	assertType<GeoPointField<"filled">>({
		longitude: 0,
		latitude: 0,
	})
	// @ts-expect-error - Filled fields cannot contain an empty value.
	assertType<GeoPointField<"filled">>({})
})

it("supports empty values", () => {
	assertType<GeoPointField>({})
	assertType<GeoPointField<"empty">>({})
	assertType<GeoPointField<"empty">>({
		// @ts-expect-error - Empty fields cannot contain a filled value.
		longitude: 0,
		// @ts-expect-error - Empty fields cannot contain a filled value.
		latitude: 0,
	})
})
