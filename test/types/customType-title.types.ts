import * as prismicTI from "@prismicio/types-internal";
import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelTitleField): true => {
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

expectType<prismic.CustomTypeModelTitleField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		single: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelTitleField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		placeholder: "string",
		single: "string",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelTitleField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.RichText,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.RichText>(
	{} as prismic.CustomTypeModelTitleField,
);
