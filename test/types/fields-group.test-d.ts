import { assertType, it } from "vitest"

import type { BooleanField, GroupField, NestedGroupField } from "../../src"

it("supports filled values", () => {
	assertType<GroupField>([
		{
			boolean: true,
		},
	])
})

it("supports empty values", () => {
	assertType<GroupField>([])
})

it("supports custom fields definition", () => {
	assertType<GroupField<{ boolean: BooleanField }>>([
		{
			boolean: true,
		},
	])
	assertType<GroupField<{ boolean: BooleanField }>>([
		{
			// @ts-expect-error - Fields must match the given type definition.
			boolean: "string",
		},
	])
})

it("supports nested groups", () => {
	assertType<GroupField<{ group: NestedGroupField }>>([])
})

it("may only contain group-compatible fields", () => {
	assertType<
		GroupField<
			// @ts-expect-error - Slice Zones are invalid within group fields.
			{
				sliceZone: any
			}
		>
	>([])
})
