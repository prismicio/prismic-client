import { expectType, expectNever } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelUIDField): true => {
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

expectType<prismic.CustomTypeModelUIDField>({
	type: prismic.CustomTypeModelFieldType.UID,
	config: {
		label: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelUIDField>({
	type: prismic.CustomTypeModelFieldType.UID,
	config: {
		label: "string",
		placeholder: "string",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelUIDField>(
	{} as prismicTI.CustomTypes.Widgets.UID,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.UID>(
	{} as prismic.CustomTypeModelUIDField,
);
