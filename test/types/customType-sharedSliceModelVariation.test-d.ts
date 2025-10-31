import { assertType, expectTypeOf, it } from "vitest"

import type { Variation } from "@prismicio/types-internal/lib/customtypes"

import type {
	CustomTypeModelBooleanField,
	CustomTypeModelGroupField,
	SharedSliceModelVariation,
} from "../../src"

it("supports basic model", () => {
	assertType<SharedSliceModelVariation>({
		id: "string",
		name: "string",
		docURL: "string",
		version: "string",
		description: "string",
		imageUrl: "string",
	})
})

it("supports custom ID", () => {
	assertType<SharedSliceModelVariation<"foo">>({
		id: "foo",
		name: "string",
		docURL: "string",
		version: "string",
		description: "string",
		imageUrl: "string",
	})
	assertType<SharedSliceModelVariation<"foo">>({
		// @ts-expect-error - Slice ID must match the given ID.
		id: "string",
	})
})

it("supports custom primary fields", () => {
	assertType<
		SharedSliceModelVariation<
			string,
			{
				foo: CustomTypeModelBooleanField
				bar: CustomTypeModelGroupField<{
					baz: CustomTypeModelBooleanField
				}>
			}
		>
	>({
		id: "foo",
		primary: {
			foo: {
				type: "Boolean",
				config: {
					label: "string",
				},
			},
			bar: {
				type: "Group",
				config: {
					label: "string",
					fields: {
						baz: {
							type: "Boolean",
							config: {
								label: "string",
							},
						},
					},
				},
			},
			// @ts-expect-error - Only given fields are valid.
			qux: {
				type: "Boolean",
				config: {
					label: "string",
				},
			},
		},
	})
})

it("supports custom items fields", () => {
	assertType<
		SharedSliceModelVariation<
			string,
			Record<string, never>,
			{ foo: CustomTypeModelBooleanField }
		>
	>({
		id: "foo",
		items: {
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

it("does not support groups in items section", () => {
	// @ts-expect-error - No arg
	assertType<
		SharedSliceModelVariation<
			string,
			Record<string, never>,
			// @ts-expect-error - Group fields are not supported.
			{ foo: CustomTypeModelGroupField }
		>
	>()
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<SharedSliceModelVariation>().toExtend<Variation>()
	expectTypeOf<Variation>().toExtend<SharedSliceModelVariation>()
})
