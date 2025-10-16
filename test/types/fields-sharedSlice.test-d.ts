import { assertType, it } from "vitest"

import type { SharedSlice, SharedSliceVariation } from "../../src"

it("supports basic structure", () => {
	assertType<SharedSlice>({
		id: "id",
		slice_type: "string",
		slice_label: null,
		variation: "string",
		version: "string",
		primary: {},
		items: [],
	})
})

it("supports custom shared slice type API ID", () => {
	assertType<SharedSlice<"foo">>({
		id: "id",
		slice_type: "foo",
		slice_label: null,
		variation: "string",
		version: "string",
		primary: {},
		items: [],
	})
	assertType<SharedSlice<"foo">>({
		// @ts-expect-error - Slice type must match the given type.
		slice_type: "bar",
	})
})

it("supports custom variation types", () => {
	assertType<SharedSlice<string, SharedSliceVariation<"foo">>>({
		id: "id",
		slice_type: "string",
		slice_label: null,
		variation: "foo",
		version: "string",
		primary: {},
		items: [],
	})
	assertType<SharedSlice<string, SharedSliceVariation<"foo">>>({
		// @ts-expect-error - Variation type must match the given type.
		variation: "bar",
	})
})
