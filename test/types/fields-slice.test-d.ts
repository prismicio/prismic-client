import { assertType, it } from "vitest"

import type {
	BooleanField,
	GroupField,
	KeyTextField,
	Slice,
	SliceZone,
} from "../../src"

it("supports basic structure", () => {
	assertType<Slice>({
		id: "id",
		slice_type: "string",
		slice_label: null,
		primary: {},
		items: [],
	})
})

it("supports slice labels", () => {
	assertType<Slice>({
		id: "id",
		slice_type: "string",
		slice_label: "string",
		primary: {},
		items: [],
	})
})

it("supports custom slice type API ID", () => {
	assertType<Slice<"foo">>({
		id: "id",
		slice_type: "foo",
		slice_label: "string",
		primary: {},
		items: [],
	})
	assertType<Slice<"foo">>({
		// @ts-expect-error - Slice type must match the given type.
		slice_type: "string",
	})
})

it("supports custom primary fields type", () => {
	assertType<Slice<string, { foo: BooleanField }>>({
		id: "id",
		slice_type: "string",
		slice_label: "string",
		primary: {
			foo: true,
			// @ts-expect-error - Only given fields are valid.
			bar: false,
		},
		items: [],
	})
})

it("supports custom items fields type", () => {
	assertType<Slice<string, { foo: BooleanField }, { bar: KeyTextField }>>({
		id: "id",
		slice_type: "string",
		slice_label: "string",
		primary: {
			foo: true,
		},
		items: [
			{
				bar: "string",
				// @ts-expect-error - Only given fields are valid.
				baz: false,
			},
		],
	})
})

it("may only contain group-compatible fields in primary", () => {
	// @ts-expect-error - No arg
	assertType<
		Slice<
			string,
			// @ts-expect-error - Groups are invalid within primary fields.
			{
				group: GroupField
			}
		>
	>()
	// @ts-expect-error - No arg
	assertType<
		Slice<
			string,
			// @ts-expect-error - Slice Zones are invalid within primary fields.
			{
				sliceZone: SliceZone
			}
		>
	>()
})

it("may only contain group-compatible fields in items", () => {
	// @ts-expect-error - No arg
	assertType<
		Slice<
			string,
			{ foo: BooleanField },
			// @ts-expect-error - Groups are invalid within item fields.
			{
				group: GroupField
			}
		>
	>()
	// @ts-expect-error - No arg
	assertType<
		Slice<
			string,
			{ foo: BooleanField },
			// @ts-expect-error - Slice Zones are invalid within item fields.
			{
				sliceZone: SliceZone
			}
		>
	>()
})
