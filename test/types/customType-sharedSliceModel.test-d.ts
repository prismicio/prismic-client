import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

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
	// @ts-expect-error - types-internal v4 type shape diverged
	expectTypeOf<SharedSliceModel>().toExtend<Internal.SharedSliceModel>()
	expectTypeOf<Internal.SharedSliceModel>().toExtend<SharedSliceModel>()
})
