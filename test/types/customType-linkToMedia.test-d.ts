import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelLinkToMediaField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelLinkToMediaField>({
		type: "Link",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelLinkToMediaField>({
		type: "Link",
		config: {
			label: "string",
			placeholder: "string",
			select: "media",
		},
	})
})

it("supports optional allowText property", () => {
	assertType<CustomTypeModelLinkToMediaField>({
		type: "Link",
		config: {
			select: "media",
			allowText: true,
		},
	})
})

it("supports optional variants property", () => {
	assertType<CustomTypeModelLinkToMediaField>({
		type: "Link",
		config: {
			select: "media",
			variants: ["string"],
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelLinkToMediaField>().toExtend<Internal.LinkModel>()
	expectTypeOf<
		Internal.LinkModel & { config?: { select: "media" } }
	>().toExtend<CustomTypeModelLinkToMediaField>()
})
