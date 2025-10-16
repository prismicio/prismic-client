import { assertType, it } from "vitest"

import type { WebhookBodyTestTrigger } from "../../src"

it("supports basic test trigger webhook structure", () => {
	assertType<WebhookBodyTestTrigger>({
		type: "test-trigger",
		domain: "string",
		apiUrl: "string",
		secret: "string",
	})
})

it("supports nullable secret", () => {
	assertType<WebhookBodyTestTrigger["secret"]>(null)
})
