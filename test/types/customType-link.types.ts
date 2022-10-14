import { expectType, expectNever } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelLinkField): true => {
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

expectType<prismic.CustomTypeModelLinkField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelLinkField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		placeholder: "string",
	},
});

/**
 * Supports optional null `select` option.
 */
expectType<prismic.CustomTypeModelLinkField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		select: null,
	},
});

/**
 * Supports optional allowTargetBlank.
 */
expectType<prismic.CustomTypeModelLinkField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		allowTargetBlank: true,
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelLinkField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.Link,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.Link>(
	{} as prismic.CustomTypeModelLinkField,
);