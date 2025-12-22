import { assertType, expectTypeOf, it } from "vitest"

import type { RichText } from "@prismicio/types-internal/lib/customtypes"

import type {
	CustomTypeModelRichTextField,
	CustomTypeModelRichTextMultiField,
	CustomTypeModelRichTextSingleField,
} from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelRichTextMultiField>({
		type: "StructuredText",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelRichTextField>({
		type: "StructuredText",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("supports multi block fields", () => {
	assertType<CustomTypeModelRichTextMultiField>({
		type: "StructuredText",
		config: {
			multi: "string",
		},
	})
})

it("supports single block fields", () => {
	assertType<CustomTypeModelRichTextSingleField>({
		type: "StructuredText",
		config: {
			single: "string",
		},
	})
})

it("supports optional allowTargetBlank", () => {
	assertType<CustomTypeModelRichTextField>({
		type: "StructuredText",
		config: {
			allowTargetBlank: true,
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelRichTextField>().toExtend<RichText>()
	expectTypeOf<RichText>().toExtend<CustomTypeModelRichTextField>()
})
