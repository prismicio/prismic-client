import { expectTypeOf, it } from "vitest"

import type { Ref, Release } from "../../src"

it("is equivalent to Ref", () => {
	expectTypeOf<Release>().toExtend<Ref>()
	expectTypeOf<Ref>().toExtend<Release>()
})
