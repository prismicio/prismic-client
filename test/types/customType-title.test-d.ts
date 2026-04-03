import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelTitleField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelTitleField>({
		type: "StructuredText",
		config: {
			label: "string",
			single: "string",
		},
	})
})

it("supports config", () => {
	assertType<CustomTypeModelTitleField>({
		type: "StructuredText",
		config: {
			label: "string",
			placeholder: "string",
			single: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	// @ts-expect-error - types-internal v4 config shape diverged
	expectTypeOf<CustomTypeModelTitleField>().toExtend<Internal.RichTextModel>()
	expectTypeOf<Internal.RichTextModel>().toExtend<CustomTypeModelTitleField>()
})
