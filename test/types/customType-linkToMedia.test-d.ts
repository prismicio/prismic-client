import { assertType, expectTypeOf, it } from "vitest"

import type { Link } from "@prismicio/types-internal/lib/customtypes"

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
	expectTypeOf<CustomTypeModelLinkToMediaField>().toExtend<Link>()
	expectTypeOf<
		Link & { config?: { select: "media" } }
	>().toExtend<CustomTypeModelLinkToMediaField>()
})
