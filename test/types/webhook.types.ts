import { TypeOf, expectType } from "ts-expect";

import * as prismic from "../../src";

/**
 * WebhookBody supports any webhook body.
 */
expectType<TypeOf<prismic.WebhookBody, prismic.WebhookBodyAPIUpdate>>(true);
expectType<TypeOf<prismic.WebhookBody, prismic.WebhookBodyTestTrigger>>(true);
