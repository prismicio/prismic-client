import { assertType, it } from "vitest"

import type { IntegrationAPIItem, IntegrationAPIResults } from "../../src"

it("supports IntegrationAPIItem structure", () => {
	assertType<IntegrationAPIItem>({
		id: "string",
		title: "string",
		description: "string",
		image_url: "string",
		last_update: 1,
		blob: { foo: "bar" },
	})
})

it("supports IntegrationAPIResults structure", () => {
	const item = {
		id: "string",
		title: "string",
		description: "string",
		image_url: "string",
		last_update: 1,
		blob: { foo: "bar" },
	} as const

	assertType<IntegrationAPIResults>({
		results_size: 2,
		results: [item, item],
	})
})
