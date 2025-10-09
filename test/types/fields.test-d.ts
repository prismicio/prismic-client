import { assertType, expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("FieldState can be filled or empty", () => {
	const value = null as unknown as prismic.FieldState

	switch (value) {
		case "filled":
		case "empty": {
			expectTypeOf(value).toBeString()
			break
		}

		default: {
			assertType<never>(value)
		}
	}
})

test("AnyRegularField supports any field compatible with a nested Group", () => {
	expectTypeOf<prismic.BooleanField>().toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.ColorField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.DateField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.EmbedField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.GeoPointField>().toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.ImageField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.IntegrationField>().toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.KeyTextField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.LinkField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.LinkToMediaField>().toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.NumberField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.ContentRelationshipField>().toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.RichTextField>().toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.SelectField>().toMatchTypeOf<prismic.AnyRegularField>()
	expectTypeOf<prismic.TimestampField>().toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.TitleField>().toMatchTypeOf<prismic.AnyRegularField>()
})

test("AnyRegularField excludes any fields not compatible with a nested Group", () => {
	expectTypeOf<prismic.SliceZone>().not.toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.GroupField>().not.toMatchTypeOf<
		prismic.AnyRegularField
	>()
	expectTypeOf<prismic.NestedGroupField>().not.toMatchTypeOf<
		prismic.AnyRegularField
	>()
})

test("AnySlicePrimaryField supports any field compatible with a slice's primary section", () => {
	expectTypeOf<prismic.GroupField>().toMatchTypeOf<
		prismic.AnySlicePrimaryField
	>()
	expectTypeOf<prismic.AnyRegularField>().toMatchTypeOf<
		prismic.AnySlicePrimaryField
	>()
})

test("AnySlicePrimaryField excludes any fields not compatible with a slice's primary section", () => {
	expectTypeOf<prismic.SliceZone>().not.toMatchTypeOf<
		prismic.AnySlicePrimaryField
	>()
})
