import { assertType, it } from "vitest"

import type { SharedSlice, Slice, SliceZone } from "../../src"

it("supports filled values", () => {
	assertType<SliceZone>([
		// Slice
		{
			id: "id",
			slice_type: "string",
			slice_label: "string",
			primary: {},
			items: [],
		},
		// Shared Slice
		{
			id: "id",
			slice_type: "string",
			slice_label: null,
			variation: "string",
			version: "string",
			primary: {},
			items: [],
		},
	])
})

it("supports empty values", () => {
	assertType<SliceZone>([])
})

it("supports custom slice definitions", () => {
	assertType<SliceZone<Slice<"foo">>>([
		{
			id: "id",
			slice_type: "foo",
			slice_label: "string",
			primary: {},
			items: [],
		},
	])
	assertType<SliceZone<Slice<"foo">>>([
		{
			// @ts-expect-error - Slice must match the given type.
			slice_type: "string",
		},
	])
})

it("supports custom shared slice definitions", () => {
	assertType<SliceZone<SharedSlice<"foo">>>([
		{
			id: "id",
			slice_type: "foo",
			slice_label: null,
			variation: "string",
			version: "string",
			primary: {},
			items: [],
		},
	])
	assertType<SliceZone<SharedSlice<"foo">>>([
		{
			// @ts-expect-error - Slice must match the given type.
			slice_type: "string",
		},
	])
})
