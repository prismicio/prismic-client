import { assertType, it } from "vitest"

import type { Ref } from "../../src"

it("supports basic ref structure", () => {
	assertType<Ref>({
		id: "string",
		ref: "string",
		label: "string",
		isMasterRef: true,
	})
})

it("supports optional scheduledAt property", () => {
	assertType<Ref>({
		id: "string",
		ref: "string",
		label: "string",
		isMasterRef: true,
		scheduledAt: "string",
	})
})
