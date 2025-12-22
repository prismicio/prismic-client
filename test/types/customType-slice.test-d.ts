import { assertType, expectTypeOf, it } from "vitest"

import type { CompositeSlice } from "@prismicio/types-internal/lib/customtypes"

import type {
	CustomTypeModelBooleanField,
	CustomTypeModelSlice,
} from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelSlice>({
		type: "Slice",
	})
})

it("supports optional properties", () => {
	assertType<CustomTypeModelSlice>({
		type: "Slice",
		fieldset: "string",
		description: "string",
		icon: "string",
		display: "list",
	})
})

it("supports custom non-repeat fields", () => {
	assertType<CustomTypeModelSlice<{ foo: CustomTypeModelBooleanField }>>({
		type: "Slice",
		"non-repeat": {
			foo: {
				type: "Boolean",
				config: {
					label: "string",
				},
			},
			// @ts-expect-error - Only given fields are valid.
			bar: {
				type: "Boolean",
				config: {
					label: "string",
				},
			},
		},
	})
})

it("supports custom repeat fields", () => {
	assertType<
		CustomTypeModelSlice<
			Record<string, never>,
			{ foo: CustomTypeModelBooleanField }
		>
	>({
		type: "Slice",
		repeat: {
			foo: {
				type: "Boolean",
				config: {
					label: "string",
				},
			},
			// @ts-expect-error - Only given fields are valid.
			bar: {
				type: "Boolean",
				config: {
					label: "string",
				},
			},
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelSlice>().toExtend<CompositeSlice>()
	expectTypeOf<CompositeSlice>().toExtend<CustomTypeModelSlice>()
})
