import { assertType, expectTypeOf, it } from "vitest"

import type { Embed } from "@prismicio/types-internal/lib/customtypes"

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
	expectTypeOf<CustomTypeModelEmbedField>().toExtend<Embed>()
	expectTypeOf<Embed>().toExtend<CustomTypeModelEmbedField>()
})
