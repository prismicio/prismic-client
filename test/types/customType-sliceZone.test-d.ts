import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type {
	CustomTypeModelSharedSlice,
	CustomTypeModelSlice,
	CustomTypeModelSliceZoneField,
} from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelSliceZoneField>({
		type: "Slices",
	})
})

it("supports fieldset", () => {
	assertType<CustomTypeModelSliceZoneField>({
		type: "Slices",
		fieldset: "string",
	})
})

it("supports labels", () => {
	assertType<CustomTypeModelSliceZoneField>({
		type: "Slices",
		fieldset: "Slice zone",
		config: {
			labels: {
				foo: [
					{
						name: "string",
						display: "string",
					},
				],
			},
		},
	})
})

it("supports custom Slice types", () => {
	assertType<
		CustomTypeModelSliceZoneField<{
			foo: CustomTypeModelSlice
			bar: CustomTypeModelSharedSlice
		}>
	>({
		type: "Slices",
		fieldset: "Slice zone",
		config: {
			labels: {},
			choices: {
				foo: {
					type: "Slice",
					fieldset: "string",
					display: "list",
					description: "string",
					icon: "string",
					repeat: {},
					"non-repeat": {},
				},
				bar: {
					type: "SharedSlice",
				},
				// @ts-expect-error - Invalid slice choice
				baz: {
					type: "SharedSlice",
				},
			},
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	// @ts-expect-error - types-internal v4 config shape diverged
	expectTypeOf<CustomTypeModelSliceZoneField>().toExtend<Internal.DynamicSlicesModel>()
	expectTypeOf<Internal.DynamicSlicesModel>().toExtend<CustomTypeModelSliceZoneField>()
})
