import { assertType, it } from "vitest"

import type { BooleanField } from "../../src"

it("supports filled values", () => {
	assertType<BooleanField>(true)
	assertType<BooleanField>(false)
})
