import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type {
	CustomTypeModelBooleanField,
	CustomTypeModelGroupField,
	CustomTypeModelNestedGroupField,
} from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelGroupField>({
		type: "Group",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelGroupField>({
		type: "Group",
		config: {
			label: "string",
		},
	})
})

it("does not support a placeholder", () => {
	assertType<CustomTypeModelGroupField>({
		type: "Group",
		config: {
			// @ts-expect-error - Does not support a placeholder.
			placeholder: "string",
		},
	})
})

it("supports custom fields", () => {
	assertType<
		CustomTypeModelGroupField<{
			foo: CustomTypeModelBooleanField
		}>
	>({
		type: "Group",
		config: {
			label: "string",
			fields: {
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
		},
	})
})

it("supports nested groups", () => {
	assertType<
		CustomTypeModelGroupField<{
			foo: CustomTypeModelNestedGroupField<{
				bar: CustomTypeModelBooleanField
			}>
		}>
	>({
		type: "Group",
		config: {
			label: "string",
			fields: {
				foo: {
					type: "Group",
					config: {
						label: "string",
						fields: {
							bar: {
								type: "Boolean",
								config: {
									label: "string",
								},
							},
						},
					},
				},
			},
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	// @ts-expect-error - types-internal v4 config shape diverged
	expectTypeOf<CustomTypeModelGroupField>().toExtend<Internal.GroupModel>()
	expectTypeOf<Internal.GroupModel>().toExtend<CustomTypeModelGroupField>()
})
