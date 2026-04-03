import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

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
	// @ts-expect-error - types-internal v4 config shape diverged
	expectTypeOf<CustomTypeModelRichTextField>().toExtend<Internal.RichTextModel>()
	expectTypeOf<Internal.RichTextModel>().toExtend<CustomTypeModelRichTextField>()
})
