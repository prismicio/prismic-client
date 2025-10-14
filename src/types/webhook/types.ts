import type { WebhookBodyAPIUpdate } from "./apiUpdate.ts"
import type { WebhookBodyTestTrigger } from "./testTrigger.ts"

export type WebhookBody = WebhookBodyAPIUpdate | WebhookBodyTestTrigger

/**
 * Types of Prismic Webhooks.
 *
 * @see More details: {@link https://prismic.io/docs/webhooks}
 */
export const WebhookType = {
	APIUpdate: "api-update",
	TestTrigger: "test-trigger",
} as const

export interface WebhookBodyBase {
	type: (typeof WebhookType)[keyof typeof WebhookType]
	domain: string
	apiUrl: string
	secret: string | null
}
