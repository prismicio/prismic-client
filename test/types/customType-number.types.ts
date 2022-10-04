import { expectType, expectNever } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelNumberField): true => {
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

expectType<prismic.CustomTypeModelNumberField>({
	type: prismic.CustomTypeModelFieldType.Number,
	config: {
		label: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelNumberField>({
	type: prismic.CustomTypeModelFieldType.Number,
	config: {
		label: "string",
		placeholder: "string",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelNumberField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.Number,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.Number>(
	{} as prismic.CustomTypeModelNumberField,
);
