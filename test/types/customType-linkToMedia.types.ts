import * as prismicTI from "@prismicio/types-internal";
import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelLinkToMediaField): true => {
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

expectType<prismic.CustomTypeModelLinkToMediaField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		select: prismic.CustomTypeModelLinkSelectType.Media,
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelLinkToMediaField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		placeholder: "string",
		select: prismic.CustomTypeModelLinkSelectType.Media,
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelLinkToMediaField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.Link & {
		// We must manually narrow `@prismicio/types-internal`'s type
		// to match a link to media field; `@prismicio/types-internal`
		// does not contain a link to media-specific type.
		config?: { select: "media" };
	},
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.Link>(
	{} as prismic.CustomTypeModelLinkToMediaField,
);
