import { assertType, it } from "vitest"

import type { Language } from "../../src"

it("supports basic language structure", () => {
	assertType<Language>({
		id: "string",
		name: "string",
		is_master: true,
	})
})
