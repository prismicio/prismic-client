import * as prismicTI from "@prismicio/types-internal";
import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelIntegrationField): true => {
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

expectType<prismic.CustomTypeModelIntegrationField>({
	type: prismic.CustomTypeModelFieldType.Integration,
	config: {
		label: "string",
		catalog: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelIntegrationField>({
	type: prismic.CustomTypeModelFieldType.Integration,
	config: {
		label: "string",
		placeholder: "string",
		catalog: "string",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelIntegrationField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.IntegrationField,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.IntegrationField>(
	{} as prismic.CustomTypeModelIntegrationField,
);
