import { expectTypeOf, it } from "vitest"

import * as lib from "../../src/richtext"

it("returns string", () => {
	expectTypeOf(lib.asText).returns.toBeString()
})
