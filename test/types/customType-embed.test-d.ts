import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelEmbedField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelEmbedField>({
		type: "Embed",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelEmbedField>({
		type: "Embed",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelEmbedField>().toExtend<Internal.EmbedModel>()
	expectTypeOf<Internal.EmbedModel>().toExtend<CustomTypeModelEmbedField>()
})
