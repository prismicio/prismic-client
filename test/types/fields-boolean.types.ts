import { expectNever } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.BooleanField): true => {
	switch (typeof value) {
		case "boolean": {
			return true;
		}

		default: {
			return expectNever(value);
		}
	}
};
