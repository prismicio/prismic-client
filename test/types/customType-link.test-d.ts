import { assertType, expectTypeOf, it } from "vitest"

import type { Link } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelLinkField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelLinkField>({
		type: "Link",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelLinkField>({
		type: "Link",
		config: {
			label: "string",
			placeholder: "string",
		},
	})
})

it("supports optional null select option", () => {
	assertType<CustomTypeModelLinkField>({
		type: "Link",
		config: {
			select: null,
		},
	})
})

it("supports optional allowTargetBlank", () => {
	assertType<CustomTypeModelLinkField>({
		type: "Link",
		config: {
			allowTargetBlank: true,
		},
	})
})

it("supports optional allowText property", () => {
	assertType<CustomTypeModelLinkField>({
		type: "Link",
		config: {
			allowText: true,
		},
	})
})

it("supports optional repeat property", () => {
	assertType<CustomTypeModelLinkField>({
		type: "Link",
		config: {
			repeat: true,
		},
	})
})

it("supports optional variants property", () => {
	assertType<CustomTypeModelLinkField>({
		type: "Link",
		config: {
			variants: ["string"],
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelLinkField>().toExtend<Link>()
	expectTypeOf<Link>().toExtend<CustomTypeModelLinkField>()
})
