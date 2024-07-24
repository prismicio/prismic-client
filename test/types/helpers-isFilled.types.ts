import type { TypeEqual } from "ts-expect"
import { expectType } from "ts-expect"

import * as prismic from "../../src"
/**
 * RichText
 */

;(value: prismic.RichTextField) => {
	if (prismic.isFilled.richText(value)) {
		expectType<TypeEqual<prismic.RichTextField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.RichTextField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.RichTextField<"filled">, typeof value>>(false)
		expectType<TypeEqual<prismic.RichTextField<"empty">, typeof value>>(true)
	}
}

/**
 * Title
 */
;(value: prismic.TitleField) => {
	if (prismic.isFilled.title(value)) {
		expectType<TypeEqual<prismic.TitleField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.TitleField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.TitleField<"filled">, typeof value>>(false)
		expectType<TypeEqual<prismic.TitleField<"empty">, typeof value>>(true)
	}
}

/**
 * Image thumbnail
 */
;(value: prismic.ImageFieldImage) => {
	if (prismic.isFilled.imageThumbnail(value)) {
		expectType<TypeEqual<prismic.ImageFieldImage<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.ImageFieldImage<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.ImageFieldImage<"filled">, typeof value>>(
			false,
		)
		expectType<TypeEqual<prismic.ImageFieldImage<"empty">, typeof value>>(true)
	}
}

/**
 * Image
 */

// Default (without thumbnail)
;(value: prismic.ImageField) => {
	if (prismic.isFilled.image(value)) {
		expectType<TypeEqual<prismic.ImageField<never, "filled">, typeof value>>(
			true,
		)
		expectType<TypeEqual<prismic.ImageField<never, "empty">, typeof value>>(
			false,
		)
	} else {
		expectType<TypeEqual<prismic.ImageField<never, "filled">, typeof value>>(
			false,
		)
		expectType<TypeEqual<prismic.ImageField<never, "empty">, typeof value>>(
			true,
		)
	}
}

// With thumbnails
;(value: prismic.ImageField<"foo">) => {
	if (prismic.isFilled.image(value)) {
		expectType<TypeEqual<prismic.ImageField<"foo", "filled">, typeof value>>(
			true,
		)
		expectType<TypeEqual<prismic.ImageField<"foo", "empty">, typeof value>>(
			false,
		)
	} else {
		expectType<TypeEqual<prismic.ImageField<"foo", "filled">, typeof value>>(
			false,
		)
		expectType<TypeEqual<prismic.ImageField<"foo", "empty">, typeof value>>(
			true,
		)
	}
}

/**
 * Link
 */

// Default
;(value: prismic.LinkField) => {
	if (prismic.isFilled.link(value)) {
		expectType<
			TypeEqual<
				prismic.LinkField<string, string, unknown, "filled">,
				typeof value
			>
		>(true)
		expectType<
			TypeEqual<
				prismic.LinkField<string, string, unknown, "empty">,
				typeof value
			>
		>(false)
	} else {
		expectType<
			TypeEqual<
				prismic.LinkField<string, string, unknown, "filled">,
				typeof value
			>
		>(false)
		expectType<
			TypeEqual<
				prismic.LinkField<string, string, unknown, "empty">,
				typeof value
			>
		>(true)
	}
}

type LinkData = { baz: prismic.RichTextField }

// With type, lang, and data
;(value: prismic.LinkField<"foo", "bar", LinkData>) => {
	if (prismic.isFilled.link(value)) {
		expectType<
			TypeEqual<
				prismic.LinkField<"foo", "bar", LinkData, "filled">,
				typeof value
			>
		>(true)
		expectType<
			TypeEqual<
				prismic.LinkField<"foo", "bar", LinkData, "empty">,
				typeof value
			>
		>(false)
	} else {
		expectType<
			TypeEqual<
				prismic.LinkField<"foo", "bar", LinkData, "filled">,
				typeof value
			>
		>(false)
		expectType<
			TypeEqual<
				prismic.LinkField<"foo", "bar", LinkData, "empty">,
				typeof value
			>
		>(true)
	}
}

/**
 * Link to media
 */
;(value: prismic.LinkToMediaField) => {
	if (prismic.isFilled.linkToMedia(value)) {
		expectType<TypeEqual<prismic.LinkToMediaField<"filled">, typeof value>>(
			true,
		)
		expectType<TypeEqual<prismic.LinkToMediaField<"empty">, typeof value>>(
			false,
		)
	} else {
		expectType<TypeEqual<prismic.LinkToMediaField<"filled">, typeof value>>(
			false,
		)
		expectType<TypeEqual<prismic.LinkToMediaField<"empty">, typeof value>>(true)
	}
}

/**
 * Content relationship
 */

// Default
;(value: prismic.ContentRelationshipField) => {
	if (prismic.isFilled.contentRelationship(value)) {
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<string, string, unknown, "filled">,
				typeof value
			>
		>(true)
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<string, string, unknown, "empty">,
				typeof value
			>
		>(false)
	} else {
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<string, string, unknown, "filled">,
				typeof value
			>
		>(false)
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<string, string, unknown, "empty">,
				typeof value
			>
		>(true)
	}
}

type ContentRelationshipData = { baz: prismic.RichTextField }

// With type, lang, and data
;(
	value: prismic.ContentRelationshipField<
		"foo",
		"bar",
		ContentRelationshipData
	>,
) => {
	if (prismic.isFilled.contentRelationship(value)) {
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<
					"foo",
					"bar",
					ContentRelationshipData,
					"filled"
				>,
				typeof value
			>
		>(true)
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<
					"foo",
					"bar",
					ContentRelationshipData,
					"empty"
				>,
				typeof value
			>
		>(false)
	} else {
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<
					"foo",
					"bar",
					ContentRelationshipData,
					"filled"
				>,
				typeof value
			>
		>(false)
		expectType<
			TypeEqual<
				prismic.ContentRelationshipField<
					"foo",
					"bar",
					ContentRelationshipData,
					"empty"
				>,
				typeof value
			>
		>(true)
	}
}

/**
 * Date
 */
;(value: prismic.DateField) => {
	if (prismic.isFilled.date(value)) {
		expectType<TypeEqual<prismic.DateField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.DateField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.DateField<"filled">, typeof value>>(false)
		expectType<TypeEqual<prismic.DateField<"empty">, typeof value>>(true)
	}
}

/**
 * Timestamp
 */
;(value: prismic.TimestampField) => {
	if (prismic.isFilled.timestamp(value)) {
		expectType<TypeEqual<prismic.TimestampField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.TimestampField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.TimestampField<"filled">, typeof value>>(false)
		expectType<TypeEqual<prismic.TimestampField<"empty">, typeof value>>(true)
	}
}

/**
 * Color
 */
;(value: prismic.ColorField) => {
	if (prismic.isFilled.color(value)) {
		expectType<TypeEqual<prismic.ColorField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.ColorField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.ColorField<"filled">, typeof value>>(false)
		expectType<TypeEqual<prismic.ColorField<"empty">, typeof value>>(true)
	}
}

/**
 * Number
 */
;(value: prismic.NumberField) => {
	if (prismic.isFilled.number(value)) {
		expectType<TypeEqual<prismic.NumberField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.NumberField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.NumberField<"filled">, typeof value>>(false)
		expectType<TypeEqual<prismic.NumberField<"empty">, typeof value>>(true)
	}
}

/**
 * KeyText
 */
;(value: prismic.KeyTextField) => {
	if (prismic.isFilled.keyText(value)) {
		expectType<TypeEqual<prismic.KeyTextField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.KeyTextField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.KeyTextField<"filled">, typeof value>>(false)
		// `""` is of type string and gets TypeScript confused in the narrowing.
		expectType<TypeEqual<prismic.KeyTextField<"empty">, typeof value | "">>(
			true,
		)
	}
}

/**
 * Select
 */

// Default
;(value: prismic.SelectField) => {
	if (prismic.isFilled.select(value)) {
		expectType<TypeEqual<prismic.SelectField<string, "filled">, typeof value>>(
			true,
		)
		expectType<TypeEqual<prismic.SelectField<string, "empty">, typeof value>>(
			false,
		)
	} else {
		expectType<TypeEqual<prismic.SelectField<string, "filled">, typeof value>>(
			false,
		)
		expectType<TypeEqual<prismic.SelectField<string, "empty">, typeof value>>(
			true,
		)
	}
}

// With enum
;(value: prismic.SelectField<"foo" | "bar">) => {
	if (prismic.isFilled.select(value)) {
		expectType<
			TypeEqual<prismic.SelectField<"foo" | "bar", "filled">, typeof value>
		>(true)
		expectType<
			TypeEqual<prismic.SelectField<"foo" | "bar", "empty">, typeof value>
		>(false)
	} else {
		expectType<
			TypeEqual<prismic.SelectField<"foo" | "bar", "filled">, typeof value>
		>(false)
		expectType<
			TypeEqual<prismic.SelectField<"foo" | "bar", "empty">, typeof value>
		>(true)
	}
}

/**
 * Embed
 */

type EmbedDefault = prismic.AnyOEmbed & prismic.OEmbedExtra

// Default
;(value: prismic.EmbedField) => {
	if (prismic.isFilled.embed(value)) {
		expectType<
			TypeEqual<prismic.EmbedField<EmbedDefault, "filled">, typeof value>
		>(true)
		expectType<
			TypeEqual<prismic.EmbedField<EmbedDefault, "empty">, typeof value>
		>(false)
	} else {
		expectType<
			TypeEqual<prismic.EmbedField<EmbedDefault, "filled">, typeof value>
		>(false)
		expectType<
			TypeEqual<prismic.EmbedField<EmbedDefault, "empty">, typeof value>
		>(true)
	}
}

type EmbedData = prismic.VideoOEmbed & { foo: string }

// With data
;(value: prismic.EmbedField<EmbedData>) => {
	if (prismic.isFilled.embed(value)) {
		expectType<
			TypeEqual<prismic.EmbedField<EmbedData, "filled">, typeof value>
		>(true)
		expectType<TypeEqual<prismic.EmbedField<EmbedData, "empty">, typeof value>>(
			false,
		)
	} else {
		expectType<
			TypeEqual<prismic.EmbedField<EmbedData, "filled">, typeof value>
		>(false)
		expectType<TypeEqual<prismic.EmbedField<EmbedData, "empty">, typeof value>>(
			true,
		)
	}
}

/**
 * GeoPoint
 */
;(value: prismic.GeoPointField) => {
	if (prismic.isFilled.geoPoint(value)) {
		expectType<TypeEqual<prismic.GeoPointField<"filled">, typeof value>>(true)
		expectType<TypeEqual<prismic.GeoPointField<"empty">, typeof value>>(false)
	} else {
		expectType<TypeEqual<prismic.GeoPointField<"filled">, typeof value>>(false)
		expectType<TypeEqual<prismic.GeoPointField<"empty">, typeof value>>(true)
	}
}

/**
 * Integration fields
 */

type IntegrationFieldDefault = Record<string, unknown>

// Default
;(value: prismic.IntegrationField) => {
	if (prismic.isFilled.integrationField(value)) {
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldDefault, "filled">,
				typeof value
			>
		>(true)
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldDefault, "empty">,
				typeof value
			>
		>(false)
	} else {
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldDefault, "filled">,
				typeof value
			>
		>(false)
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldDefault, "empty">,
				typeof value
			>
		>(true)
	}
}

type IntegrationFieldData = { foo: string }

// With data
;(value: prismic.IntegrationField<IntegrationFieldData>) => {
	if (prismic.isFilled.integrationField(value)) {
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldData, "filled">,
				typeof value
			>
		>(true)
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldData, "empty">,
				typeof value
			>
		>(false)
	} else {
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldData, "filled">,
				typeof value
			>
		>(false)
		expectType<
			TypeEqual<
				prismic.IntegrationField<IntegrationFieldData, "empty">,
				typeof value
			>
		>(true)
	}
}

/**
 * Group
 */

type GroupDefault = Record<
	string,
	prismic.AnyRegularField | prismic.NestedGroupField
>

// Default
;(value: prismic.GroupField) => {
	if (prismic.isFilled.group(value)) {
		expectType<
			TypeEqual<prismic.GroupField<GroupDefault, "filled">, typeof value>
		>(true)
		expectType<
			TypeEqual<prismic.GroupField<GroupDefault, "empty">, typeof value>
		>(false)
	} else {
		expectType<
			TypeEqual<prismic.GroupField<GroupDefault, "filled">, typeof value>
		>(false)
		expectType<
			TypeEqual<prismic.GroupField<GroupDefault, "empty">, typeof value>
		>(true)
	}
}

type GroupFields = { foo: prismic.RichTextField }

// With fields
;(value: prismic.GroupField<GroupFields>) => {
	if (prismic.isFilled.group(value)) {
		expectType<
			TypeEqual<prismic.GroupField<GroupFields, "filled">, typeof value>
		>(true)
		expectType<
			TypeEqual<prismic.GroupField<GroupFields, "empty">, typeof value>
		>(false)
	} else {
		expectType<
			TypeEqual<prismic.GroupField<GroupFields, "filled">, typeof value>
		>(false)
		expectType<
			TypeEqual<prismic.GroupField<GroupFields, "empty">, typeof value>
		>(true)
	}
}

/**
 * SliceZone
 */

type SliceZoneDefault = prismic.Slice | prismic.SharedSlice

// Default
;(value: prismic.SliceZone) => {
	if (prismic.isFilled.sliceZone(value)) {
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneDefault, "filled">, typeof value>
		>(true)
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneDefault, "empty">, typeof value>
		>(false)
	} else {
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneDefault, "filled">, typeof value>
		>(false)
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneDefault, "empty">, typeof value>
		>(true)
	}
}

type SliceZoneSlices = prismic.Slice<"foo">

// With fields
;(value: prismic.SliceZone<SliceZoneSlices>) => {
	if (prismic.isFilled.sliceZone(value)) {
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneSlices, "filled">, typeof value>
		>(true)
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneSlices, "empty">, typeof value>
		>(false)
	} else {
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneSlices, "filled">, typeof value>
		>(false)
		expectType<
			TypeEqual<prismic.SliceZone<SliceZoneSlices, "empty">, typeof value>
		>(true)
	}
}
