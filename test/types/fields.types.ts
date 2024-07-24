import type { TypeOf } from "ts-expect"
import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"
/**
 * FieldState
 */

;(value: prismic.FieldState): true => {
	switch (value) {
		case "filled":
		case "empty": {
			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

/**
 * AnyRegularField supports any field compatible with a nested Group.
 */
expectType<TypeOf<prismic.AnyRegularField, prismic.BooleanField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.ColorField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.DateField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.EmbedField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.GeoPointField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.ImageField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.IntegrationField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.KeyTextField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.LinkField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.LinkToMediaField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.NumberField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.ContentRelationshipField>>(
	true,
)
expectType<TypeOf<prismic.AnyRegularField, prismic.RichTextField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.SelectField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.TimestampField>>(true)
expectType<TypeOf<prismic.AnyRegularField, prismic.TitleField>>(true)

/**
 * AnyRegularField excludes any fields not compatible with a nested Group.
 */
expectType<TypeOf<prismic.AnyRegularField, prismic.SliceZone>>(false)
expectType<TypeOf<prismic.AnyRegularField, prismic.GroupField>>(false)
expectType<TypeOf<prismic.AnyRegularField, prismic.NestedGroupField>>(false)

/**
 * AnySlicePrimaryField supports any field compatible with a slice's primary
 * section.
 */
expectType<TypeOf<prismic.AnySlicePrimaryField, prismic.GroupField>>(true)
expectType<TypeOf<prismic.AnySlicePrimaryField, prismic.AnyRegularField>>(true)

/**
 * AnySlicePrimaryField excludes any fields not compatible with a slice's
 * primary section.
 */
expectType<TypeOf<prismic.AnySlicePrimaryField, prismic.SliceZone>>(false)
