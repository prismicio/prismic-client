import { expectTypeOf, it } from "vitest"

import type {
	AnyRegularField,
	AnySlicePrimaryField,
	BooleanField,
	ColorField,
	ContentRelationshipField,
	DateField,
	EmbedField,
	FieldState,
	GeoPointField,
	GroupField,
	ImageField,
	IntegrationField,
	KeyTextField,
	LinkField,
	LinkToMediaField,
	NestedGroupField,
	NumberField,
	RichTextField,
	SelectField,
	SliceZone,
	TimestampField,
	TitleField,
} from "../../src"

it("supports FieldState enum", () => {
	expectTypeOf<"empty">().toExtend<FieldState>()
	expectTypeOf<"filled">().toExtend<FieldState>()
})

it("AnyRegularField supports fields compatible with nested Group", () => {
	expectTypeOf<BooleanField>().toExtend<AnyRegularField>()
	expectTypeOf<ColorField>().toExtend<AnyRegularField>()
	expectTypeOf<DateField>().toExtend<AnyRegularField>()
	expectTypeOf<EmbedField>().toExtend<AnyRegularField>()
	expectTypeOf<GeoPointField>().toExtend<AnyRegularField>()
	expectTypeOf<ImageField>().toExtend<AnyRegularField>()
	expectTypeOf<IntegrationField>().toExtend<AnyRegularField>()
	expectTypeOf<KeyTextField>().toExtend<AnyRegularField>()
	expectTypeOf<LinkField>().toExtend<AnyRegularField>()
	expectTypeOf<LinkToMediaField>().toExtend<AnyRegularField>()
	expectTypeOf<NumberField>().toExtend<AnyRegularField>()
	expectTypeOf<ContentRelationshipField>().toExtend<AnyRegularField>()
	expectTypeOf<RichTextField>().toExtend<AnyRegularField>()
	expectTypeOf<SelectField>().toExtend<AnyRegularField>()
	expectTypeOf<TimestampField>().toExtend<AnyRegularField>()
	expectTypeOf<TitleField>().toExtend<AnyRegularField>()
})

it("AnyRegularField excludes fields not compatible with nested Group", () => {
	expectTypeOf<SliceZone>().not.toExtend<AnyRegularField>()
	expectTypeOf<GroupField>().not.toExtend<AnyRegularField>()
	expectTypeOf<NestedGroupField>().not.toExtend<AnyRegularField>()
})

it("AnySlicePrimaryField supports fields compatible with slice primary section", () => {
	expectTypeOf<GroupField>().toExtend<AnySlicePrimaryField>()
	expectTypeOf<AnyRegularField>().toExtend<AnySlicePrimaryField>()
})

it("AnySlicePrimaryField excludes fields not compatible with slice primary section", () => {
	expectTypeOf<SliceZone>().not.toExtend<AnySlicePrimaryField>()
})
