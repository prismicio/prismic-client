import { assertType, it } from "vitest"

import type {
	AnyOEmbed,
	AnyRegularField,
	ColorField,
	ContentRelationshipField,
	DateField,
	EmbedField,
	GeoPointField,
	GroupField,
	ImageField,
	ImageFieldImage,
	IntegrationField,
	IntegrationFieldData,
	KeyTextField,
	LinkField,
	LinkToMediaField,
	NestedGroupField,
	NumberField,
	OEmbedExtra,
	RichTextField,
	SelectField,
	SharedSlice,
	Slice,
	SliceZone,
	TableField,
	TimestampField,
	TitleField,
	VideoOEmbed,
} from "../../src"
import { isFilled } from "../../src"

it("narrows RichTextField from generic to filled/empty", () => {
	const value = undefined as unknown as RichTextField

	if (isFilled.richText(value)) {
		assertType<RichTextField<"filled">>(value)
	} else {
		assertType<RichTextField<"empty">>(value)
	}
})

it("narrows TitleField from generic to filled/empty", () => {
	const value = undefined as unknown as TitleField

	if (isFilled.title(value)) {
		assertType<TitleField<"filled">>(value)
	} else {
		assertType<TitleField<"empty">>(value)
	}
})

it("narrows ImageFieldImage from generic to filled/empty", () => {
	const value = undefined as unknown as ImageFieldImage

	if (isFilled.imageThumbnail(value)) {
		assertType<ImageFieldImage<"filled">>(value)
	} else {
		assertType<ImageFieldImage<"empty">>(value)
	}
})

it("narrows ImageField without thumbnails from generic to filled/empty", () => {
	const value = undefined as unknown as ImageField

	if (isFilled.image(value)) {
		assertType<ImageField<never, "filled">>(value)
	} else {
		assertType<ImageField<never, "empty">>(value)
	}
})

it("narrows ImageField with thumbnails from generic to filled/empty", () => {
	const value = undefined as unknown as ImageField<"foo">

	if (isFilled.image(value)) {
		assertType<ImageField<"foo", "filled">>(value)
	} else {
		assertType<ImageField<"foo", "empty">>(value)
	}
})

it("narrows LinkField from generic to filled/empty", () => {
	const value = undefined as unknown as LinkField

	if (isFilled.link(value)) {
		assertType<LinkField<string, string, unknown, "filled">>(value)
	} else {
		assertType<LinkField<string, string, unknown, "empty">>(value)
	}
})

it("narrows LinkField with type, lang, and data from generic to filled/empty", () => {
	type LinkData = { baz: RichTextField }
	const value = undefined as unknown as LinkField<"foo", "bar", LinkData>

	if (isFilled.link(value)) {
		assertType<LinkField<"foo", "bar", LinkData, "filled">>(value)
	} else {
		assertType<LinkField<"foo", "bar", LinkData, "empty">>(value)
	}
})

it("narrows LinkToMediaField from generic to filled/empty", () => {
	const value = undefined as unknown as LinkToMediaField

	if (isFilled.linkToMedia(value)) {
		assertType<LinkToMediaField<"filled">>(value)
	} else {
		assertType<LinkToMediaField<"empty">>(value)
	}
})

it("narrows ContentRelationshipField from generic to filled/empty", () => {
	const value = undefined as unknown as ContentRelationshipField

	if (isFilled.contentRelationship(value)) {
		assertType<ContentRelationshipField<string, string, unknown, "filled">>(
			value,
		)
	} else {
		assertType<ContentRelationshipField<string, string, unknown, "empty">>(
			value,
		)
	}
})

it("narrows ContentRelationshipField with type, lang, and data from generic to filled/empty", () => {
	type ContentRelationshipData = { baz: RichTextField }
	const value = undefined as unknown as ContentRelationshipField<
		"foo",
		"bar",
		ContentRelationshipData
	>

	if (isFilled.contentRelationship(value)) {
		assertType<
			ContentRelationshipField<"foo", "bar", ContentRelationshipData, "filled">
		>(value)
	} else {
		assertType<
			ContentRelationshipField<"foo", "bar", ContentRelationshipData, "empty">
		>(value)
	}
})

it("supports type guards for ContentRelationshipField", () => {
	type ContentRelationshipData = { baz: RichTextField }
	;(value: ContentRelationshipField<"foo", "bar", ContentRelationshipData>) => {
		isFilled.contentRelationship<typeof value>(value)
		isFilled.contentRelationship<ContentRelationshipField>(value)
		isFilled.contentRelationship<
			ContentRelationshipField<"baz", "bazz", ContentRelationshipData>
			// @ts-expect-error - Testing mismatch
		>(value)
	}
})

it("narrows DateField from generic to filled/empty", () => {
	const value = undefined as unknown as DateField

	if (isFilled.date(value)) {
		assertType<DateField<"filled">>(value)
	} else {
		assertType<DateField<"empty">>(value)
	}
})

it("narrows TimestampField from generic to filled/empty", () => {
	const value = undefined as unknown as TimestampField

	if (isFilled.timestamp(value)) {
		assertType<TimestampField<"filled">>(value)
	} else {
		assertType<TimestampField<"empty">>(value)
	}
})

it("narrows ColorField from generic to filled/empty", () => {
	const value = undefined as unknown as ColorField

	if (isFilled.color(value)) {
		assertType<ColorField<"filled">>(value)
	} else {
		assertType<ColorField<"empty">>(value)
	}
})

it("narrows NumberField from generic to filled/empty", () => {
	const value = undefined as unknown as NumberField

	if (isFilled.number(value)) {
		assertType<NumberField<"filled">>(value)
	} else {
		assertType<NumberField<"empty">>(value)
	}
})

it("narrows KeyTextField from generic to filled/empty", () => {
	const value = undefined as unknown as KeyTextField

	if (isFilled.keyText(value)) {
		assertType<KeyTextField<"filled">>(value)
	} else {
		assertType<KeyTextField<"empty">>(value)
	}
})

it("narrows SelectField from generic to filled/empty", () => {
	const value = undefined as unknown as SelectField

	if (isFilled.select(value)) {
		assertType<SelectField<string, "filled">>(value)
	} else {
		assertType<SelectField<string, "empty">>(value)
	}
})

it("narrows SelectField with enum from generic to filled/empty", () => {
	const value = undefined as unknown as SelectField<"foo" | "bar">

	if (isFilled.select(value)) {
		assertType<SelectField<"foo" | "bar", "filled">>(value)
	} else {
		assertType<SelectField<"foo" | "bar", "empty">>(value)
	}
})

it("narrows EmbedField from generic to filled/empty", () => {
	type EmbedDefault = AnyOEmbed & OEmbedExtra
	const value = undefined as unknown as EmbedField

	if (isFilled.embed(value)) {
		assertType<EmbedField<EmbedDefault, "filled">>(value)
	} else {
		assertType<EmbedField<EmbedDefault, "empty">>(value)
	}
})

it("narrows EmbedField with data from generic to filled/empty", () => {
	type EmbedData = VideoOEmbed & { foo: string }
	const value = undefined as unknown as EmbedField<EmbedData>

	if (isFilled.embed(value)) {
		assertType<EmbedField<EmbedData, "filled">>(value)
	} else {
		assertType<EmbedField<EmbedData, "empty">>(value)
	}
})

it("narrows GeoPointField from generic to filled/empty", () => {
	const value = undefined as unknown as GeoPointField

	if (isFilled.geoPoint(value)) {
		assertType<GeoPointField<"filled">>(value)
	} else {
		assertType<GeoPointField<"empty">>(value)
	}
})

it("narrows TableField from generic to filled/empty", () => {
	const value = undefined as unknown as TableField

	if (isFilled.table(value)) {
		assertType<TableField<"filled">>(value)
	} else {
		assertType<TableField<"empty">>(value)
	}
})

it("narrows IntegrationField from generic to filled/empty", () => {
	const value = undefined as unknown as IntegrationField

	if (isFilled.integration(value)) {
		assertType<IntegrationField<IntegrationFieldData, "filled">>(value)
	} else {
		assertType<IntegrationField<IntegrationFieldData, "empty">>(value)
	}
})

it("narrows IntegrationField with data from generic to filled/empty", () => {
	type IntegrationFieldData = { foo: string }
	const value = undefined as unknown as IntegrationField<IntegrationFieldData>

	if (isFilled.integration(value)) {
		assertType<IntegrationField<IntegrationFieldData, "filled">>(value)
	} else {
		assertType<IntegrationField<IntegrationFieldData, "empty">>(value)
	}
})

it("narrows GroupField from generic to filled/empty", () => {
	type GroupDefault = Record<string, AnyRegularField | NestedGroupField>
	const value = undefined as unknown as GroupField

	if (isFilled.group(value)) {
		assertType<GroupField<GroupDefault, "filled">>(value)
	} else {
		assertType<GroupField<GroupDefault, "empty">>(value)
	}
})

it("narrows GroupField with fields from generic to filled/empty", () => {
	type GroupFields = { foo: RichTextField }
	const value = undefined as unknown as GroupField<GroupFields>

	if (isFilled.group(value)) {
		assertType<GroupField<GroupFields, "filled">>(value)
	} else {
		assertType<GroupField<GroupFields, "empty">>(value)
	}
})

it("narrows SliceZone from generic to filled/empty", () => {
	type SliceZoneDefault = Slice | SharedSlice
	const value = undefined as unknown as SliceZone

	if (isFilled.sliceZone(value)) {
		assertType<SliceZone<SliceZoneDefault, "filled">>(value)
	} else {
		assertType<SliceZone<SliceZoneDefault, "empty">>(value)
	}
})

it("narrows SliceZone with slices from generic to filled/empty", () => {
	type SliceZoneSlices = Slice<"foo">
	const value = undefined as unknown as SliceZone<SliceZoneSlices>

	if (isFilled.sliceZone(value)) {
		assertType<SliceZone<SliceZoneSlices, "filled">>(value)
	} else {
		assertType<SliceZone<SliceZoneSlices, "empty">>(value)
	}
})
