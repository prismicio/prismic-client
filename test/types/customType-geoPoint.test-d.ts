import { assertType, expectTypeOf, it } from "vitest"

import type { GeoPoint } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelGeoPointField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelGeoPointField>({
		type: "GeoPoint",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelGeoPointField>({
		type: "GeoPoint",
		config: {
			label: "string",
		},
	})
})

it("does not support a placeholder", () => {
	assertType<CustomTypeModelGeoPointField>({
		type: "GeoPoint",
		config: {
			// @ts-expect-error - Does not support a placeholder.
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelGeoPointField>().toExtend<GeoPoint>()
	expectTypeOf<GeoPoint>().toExtend<CustomTypeModelGeoPointField>()
})
