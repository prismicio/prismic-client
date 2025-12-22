import { assertType, it } from "vitest"

import type {
	BooleanField,
	GroupField,
	KeyTextField,
	SharedSliceVariation,
} from "../../src"

it("supports basic structure", () => {
	assertType<SharedSliceVariation>({
		variation: "string",
		version: "string",
		primary: {},
		items: [],
	})
})

it("supports custom API ID", () => {
	assertType<SharedSliceVariation<"foo">>({
		variation: "foo",
		version: "string",
		primary: {},
		items: [],
	})
	assertType<SharedSliceVariation<"foo">>({
		// @ts-expect-error - Variation type must match the given type.
		variation: "string",
	})
})

it("supports custom primary fields type", () => {
	assertType<
		SharedSliceVariation<string, { foo: BooleanField; bar: GroupField }>
	>({
		variation: "string",
		version: "string",
		primary: {
			foo: true,
			bar: [],
			// @ts-expect-error - Only given fields are valid.
			baz: false,
		},
		items: [],
	})
})

it("supports custom items fields type", () => {
	assertType<
		SharedSliceVariation<string, Record<never, never>, { bar: KeyTextField }>
	>({
		variation: "string",
		version: "string",
		primary: {},
		items: [
			{
				bar: "string",
				// @ts-expect-error - Only given fields are valid.
				baz: false,
			},
		],
	})
})

it("does not support groups in items section", () => {
	// @ts-expect-error - No arg
	assertType<
		SharedSliceVariation<
			string,
			Record<never, never>,
			// @ts-expect-error - Group fields are not supported.
			{ foo: GroupField }
		>
	>()
})
