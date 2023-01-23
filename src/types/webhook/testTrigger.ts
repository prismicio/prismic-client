import { WebhookBodyBase, WebhookType } from "./types";

/**
 * Webhook payload sent when a test webhook action is triggered.
 *
 * @see More details: {@link https://prismic.io/docs/webhooks}
 */
export interface WebhookBodyTestTrigger extends WebhookBodyBase {
	type: typeof WebhookType.TestTrigger;
}
