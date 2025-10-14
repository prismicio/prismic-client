import type { TypeOf } from "ts-expect"
import { expectType } from "ts-expect"

import type * as prismic from "../../src/index.ts"

/**
 * WebhookBody supports any webhook body.
 */
expectType<TypeOf<prismic.WebhookBody, prismic.WebhookBodyAPIUpdate>>(true)
expectType<TypeOf<prismic.WebhookBody, prismic.WebhookBodyTestTrigger>>(true)
