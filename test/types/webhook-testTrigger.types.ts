import { expectType, expectNever } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.WebhookBodyTestTrigger): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value);
			}

			return true;
		}

		default: {
			return expectNever(value);
		}
	}
};

expectType<prismic.WebhookBodyTestTrigger>({
	type: "test-trigger",
	domain: "string",
	apiUrl: "string",
	secret: "string",
});

/**
 * Secret is nullable.
 */
expectType<prismic.WebhookBodyTestTrigger["secret"]>(null);
