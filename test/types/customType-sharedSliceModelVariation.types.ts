import * as prismicTI from "@prismicio/types-internal";
import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.SharedSliceModelVariation): true => {
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

expectType<prismic.SharedSliceModelVariation>({
	id: "string",
	name: "string",
	docURL: "string",
	version: "string",
	description: "string",
	primary: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
	items: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
	imageUrl: "string",
});

/**
 * Supports custom ID.
 */
expectType<prismic.SharedSliceModelVariation<"foo">>({
	id: "foo",
	name: "string",
	docURL: "string",
	version: "string",
	description: "string",
	primary: {},
	items: {},
	imageUrl: "string",
});
expectType<prismic.SharedSliceModelVariation<"foo">>({
	// @ts-expect-error - Slice ID must match the given ID.
	id: "string",
	name: "string",
	docURL: "string",
	version: "string",
	description: "string",
	primary: {},
	items: {},
	imageUrl: "string",
});

/**
 * Supports custom primary fields.
 */
expectType<
	prismic.SharedSliceModelVariation<
		string,
		{ foo: prismic.CustomTypeModelBooleanField }
	>
>({
	id: "foo",
	name: "string",
	docURL: "string",
	version: "string",
	description: "string",
	primary: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
		// @ts-expect-error - Only given fields are valid.
		bar: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
	items: {},
	imageUrl: "string",
});

/**
 * Supports custom items fields.
 */
expectType<
	prismic.SharedSliceModelVariation<
		string,
		Record<string, never>,
		{ foo: prismic.CustomTypeModelBooleanField }
	>
>({
	id: "foo",
	name: "string",
	docURL: "string",
	version: "string",
	description: "string",
	primary: {},
	items: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
		// @ts-expect-error - Only given fields are valid.
		bar: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
	imageUrl: "string",
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.SharedSliceModelVariation>(
	{} as prismicTI.CustomTypes.Widgets.Slices.Variation,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Slices.Variation>(
	{} as prismic.SharedSliceModelVariation,
);
