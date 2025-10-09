import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("KeyTextField type structure", () => {
	expectTypeOf<prismic.KeyTextField>().toEqualTypeOf<string | null | "">()
})

test("KeyTextField filled state", () => {
	expectTypeOf<prismic.KeyTextField<"filled">>().toEqualTypeOf<string>()
})

test("KeyTextField empty state", () => {
	expectTypeOf<prismic.KeyTextField<"empty">>().toEqualTypeOf<null | "">()
})
