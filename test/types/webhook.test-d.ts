import { expectTypeOf, it } from "vitest"

import type {
	WebhookBody,
	WebhookBodyAPIUpdate,
	WebhookBodyTestTrigger,
} from "../../src"

it("supports any webhook body", () => {
	expectTypeOf<WebhookBodyAPIUpdate>().toExtend<WebhookBody>()
	expectTypeOf<WebhookBodyTestTrigger>().toExtend<WebhookBody>()
})
