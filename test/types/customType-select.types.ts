import { expectType, expectNever } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelSelectField): true => {
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

expectType<prismic.CustomTypeModelSelectField>({
	type: prismic.CustomTypeModelFieldType.Select,
	config: {
		label: "string",
		options: ["string"],
	},
});

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelSelectField>({
	type: prismic.CustomTypeModelFieldType.Select,
	config: {
		label: "string",
		placeholder: "string",
		options: ["string"],
	},
});

/**
 * Supports optional default value.
 */
expectType<prismic.CustomTypeModelSelectField>({
	type: prismic.CustomTypeModelFieldType.Select,
	config: {
		label: "string",
		placeholder: "string",
		options: ["string"],
		default_value: "string",
	},
});

/**
 * Supports custom options type.
 */
expectType<prismic.CustomTypeModelSelectField<"foo">>({
	type: prismic.CustomTypeModelFieldType.Select,
	config: {
		label: "string",
		placeholder: "string",
		options: [
			"foo",
			// @ts-expect-error - Only given options are valid.
			"bar",
		],
	},
});

/**
 * Supports custom default value type.
 */
expectType<prismic.CustomTypeModelSelectField<string, "foo">>({
	type: prismic.CustomTypeModelFieldType.Select,
	config: {
		label: "string",
		placeholder: "string",
		options: ["string"],
		default_value: "foo",
	},
});

/**
 * Default value must be one of the given options.
 */
expectType<prismic.CustomTypeModelSelectField<"foo">>({
	type: prismic.CustomTypeModelFieldType.Select,
	config: {
		label: "string",
		placeholder: "string",
		options: ["foo"],
		default_value: "foo",
	},
});
expectType<prismic.CustomTypeModelSelectField<"foo">>({
	type: prismic.CustomTypeModelFieldType.Select,
	config: {
		label: "string",
		placeholder: "string",
		options: ["foo"],
		// @ts-expect-error - Default value must be one of the given options.
		default_value: "bar",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelSelectField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.Select,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.Select>(
	{} as prismic.CustomTypeModelSelectField,
);
