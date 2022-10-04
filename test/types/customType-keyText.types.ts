import { expectType, expectNever } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelKeyTextField): true => {
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

expectType<prismic.CustomTypeModelKeyTextField>({
	type: prismic.CustomTypeModelFieldType.Text,
	config: {
		label: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelKeyTextField>({
	type: prismic.CustomTypeModelFieldType.Text,
	config: {
		label: "string",
		placeholder: "string",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelKeyTextField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.Text,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.Text>(
	{} as prismic.CustomTypeModelKeyTextField,
);
