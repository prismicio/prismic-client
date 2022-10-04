import { expectType, expectNever } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.Ref): true => {
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

expectType<prismic.Ref>({
	id: "string",
	ref: "string",
	label: "string",
	isMasterRef: true,
	scheduledAt: "string",
});

/**
 * Supports optional `scheduledAt` property.
 */
expectType<prismic.Ref>({
	id: "string",
	ref: "string",
	label: "string",
	isMasterRef: true,
});
