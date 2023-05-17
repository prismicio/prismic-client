import { WebhookBodyBase, WebhookType } from "./types";

/**
 * Webhook payload sent when a Prismic repository content is updated.
 *
 * @see More details: {@link https://prismic.io/docs/webhooks}
 */
export interface WebhookBodyAPIUpdate extends WebhookBodyBase {
	type: typeof WebhookType.APIUpdate;
	masterRef?: string;
	releases: WebhookBodyAPIUpdateOperations<WebhookBodyAPIUpdateRelease>;
	masks: WebhookBodyAPIUpdateOperations<WebhookBodyAPIUpdateMask>;
	tags: WebhookBodyAPIUpdateOperations<WebhookBodyAPIUpdateTag>;
	documents: string[];
	/**
	 * @deprecated Experiments are no longer supported by Prismic.
	 */
	experiments?: WebhookBodyAPIUpdateOperations<unknown>;
}

interface WebhookBodyAPIUpdateOperations<T> {
	update?: T[];
	addition?: T[];
	deletion?: T[];
}

/**
 * Metadata representing a mask (also called a custom type).
 *
 * @see More details: {@link https://prismic.io/docs/custom-types}
 */
interface WebhookBodyAPIUpdateMask {
	id: string;
	label: string;
}

/**
 * Metadata representing a tag.
 *
 * @see More details: {@link https://prismic.io/docs/guides/document-tags}
 */
interface WebhookBodyAPIUpdateTag {
	id: string;
}

/**
 * Metadata representing a Release.
 *
 * @see More details: {@link https://prismic.io/docs/guides/draft-plan-and-schedule-content#releases}
 */
interface WebhookBodyAPIUpdateRelease {
	id: string;
	ref: string;
	label: string;
	documents: string[];
}
