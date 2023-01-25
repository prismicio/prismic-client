import { WebhookBodyAPIUpdate } from "./apiUpdate";
import { WebhookBodyTestTrigger } from "./testTrigger";

export type WebhookBody = WebhookBodyAPIUpdate | WebhookBodyTestTrigger;

/**
 * Types of Prismic Webhooks.
 *
 * @see More details: {@link https://prismic.io/docs/webhooks}
 */
export const WebhookType = {
	APIUpdate: "api-update",
	TestTrigger: "test-trigger",
} as const;

export interface WebhookBodyBase {
	type: (typeof WebhookType)[keyof typeof WebhookType];
	domain: string;
	apiUrl: string;
	secret: string | null;
}
