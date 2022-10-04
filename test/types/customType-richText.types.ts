import { expectType, expectNever, TypeOf } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelRichTextField): true => {
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

/**
 * Supports multi block fields.
 */
expectType<
	TypeOf<
		prismic.CustomTypeModelRichTextField,
		prismic.CustomTypeModelRichTextMultiField
	>
>(true);
expectType<prismic.CustomTypeModelRichTextMultiField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		multi: "string",
	},
});

/**
 * Supports single block fields.
 */
expectType<
	TypeOf<
		prismic.CustomTypeModelRichTextField,
		prismic.CustomTypeModelRichTextSingleField
	>
>(true);
expectType<prismic.CustomTypeModelRichTextSingleField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		single: "string",
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelRichTextField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		placeholder: "string",
		multi: "string",
	},
});

/**
 * Supports optional allowTargetBlank.
 */
expectType<prismic.CustomTypeModelRichTextField>({
	type: prismic.CustomTypeModelFieldType.StructuredText,
	config: {
		label: "string",
		multi: "string",
		allowTargetBlank: true,
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelRichTextField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.RichText,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.RichText>(
	{} as prismic.CustomTypeModelRichTextField,
);
