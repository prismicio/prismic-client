import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("GeoPointField type structure", () => {
	expectTypeOf<prismic.GeoPointField>().toEqualTypeOf<
		{ latitude: number; longitude: number } | Record<string, never>
	>()
})

test("GeoPointField filled state", () => {
	expectTypeOf<prismic.GeoPointField<"filled">>().toEqualTypeOf<{
		latitude: number
		longitude: number
	}>()
})

test("GeoPointField empty state", () => {
	expectTypeOf<prismic.GeoPointField<"empty">>().toEqualTypeOf<Record<string, never>>()
})
