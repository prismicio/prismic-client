import { assertType, it } from "vitest"

import type { Tags } from "../../src"

it("supports basic tags", () => {
	assertType<Tags>(["string"])
})

it("supports empty lists", () => {
	assertType<Tags>([])
})

it("supports custom tag enum-like (string union)", () => {
	assertType<Tags<"foo" | "bar">>(["foo", "bar"])
	assertType<Tags<"foo" | "bar">>([
		// @ts-expect-error - Only given tags are valid.
		"string",
	])
})
