import { assertType, expectTypeOf, it } from "vitest"

import type { Select } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelSelectField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelSelectField>({
		type: "Select",
		config: {
			options: ["string"],
		},
	})
})

it("supports config", () => {
	assertType<CustomTypeModelSelectField>({
		type: "Select",
		config: {
			label: "string",
			placeholder: "string",
			options: ["string"],
		},
	})
})

it("supports optional default value", () => {
	assertType<CustomTypeModelSelectField>({
		type: "Select",
		config: {
			default_value: "string",
		},
	})
})

it("supports custom options type", () => {
	assertType<CustomTypeModelSelectField<"foo">>({
		type: "Select",
		config: {
			options: [
				"foo",
				// @ts-expect-error - Only given options are valid.
				"bar",
			],
		},
	})
})

it("supports custom default value type", () => {
	assertType<CustomTypeModelSelectField<string, "foo">>({
		type: "Select",
		config: {
			default_value: "foo",
		},
	})
	assertType<CustomTypeModelSelectField<"foo">>({
		type: "Select",
		config: {
			// @ts-expect-error - Default value must be one of the given options.
			default_value: "bar",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelSelectField>().toExtend<Select>()
	expectTypeOf<Select>().toExtend<CustomTypeModelSelectField>()
})
