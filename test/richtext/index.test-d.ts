import { expectTypeOf, it } from "vitest"

import * as lib from "../../src/richtext.ts"

it("returns string", () => {
	expectTypeOf(lib.asText).returns.toBeString()
})
