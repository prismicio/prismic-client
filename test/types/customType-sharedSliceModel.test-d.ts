import { assertType, expectTypeOf, it } from "vitest"

import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes"

import type { SharedSliceModel, SharedSliceModelVariation } from "../../src"

it("supports basic model", () => {
	assertType<SharedSliceModel>({
		type: "SharedSlice",
		id: "string",
		name: "string",
		variations: [],
	})
})

it("supports description", () => {
	assertType<SharedSliceModel>({
		type: "SharedSlice",
		id: "string",
		name: "string",
		description: "string",
		variations: [],
	})
})

it("supports custom ID", () => {
	assertType<SharedSliceModel<"foo">>({
		type: "SharedSlice",
		id: "foo",
		name: "string",
		variations: [],
	})
	assertType<SharedSliceModel<"foo">>({
		// @ts-expect-error - Slice ID must match the given ID.
		id: "string",
	})
})

it("supports custom variations", () => {
	assertType<SharedSliceModel<string, SharedSliceModelVariation<"foo">>>({
		type: "SharedSlice",
		id: "string",
		variations: [
			{
				id: "foo",
				name: "string",
				docURL: "string",
				description: "string",
				imageUrl: "string",
				version: "string",
			},
			{
				// @ts-expect-error - Slice must match the given type.
				id: "bar",
			},
		],
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<SharedSliceModel>().toExtend<SharedSlice>()
	expectTypeOf<SharedSlice>().toExtend<SharedSliceModel>()
})
