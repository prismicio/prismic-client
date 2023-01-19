import * as prismicTI from "@prismicio/types-internal";
import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelDateField): true => {
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

expectType<prismic.CustomTypeModelDateField>({
	type: prismic.CustomTypeModelFieldType.Date,
	config: {
		label: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelDateField>({
	type: prismic.CustomTypeModelFieldType.Date,
	config: {
		label: "string",
		placeholder: "string",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelDateField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.Date,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.Date>(
	{} as prismic.CustomTypeModelDateField,
);
