import { expectType, expectNever } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelSliceZoneField): true => {
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

expectType<prismic.CustomTypeModelSliceZoneField>({
	type: prismic.CustomTypeModelFieldType.Slices,
	fieldset: "Slice zone",
	config: {
		labels: {
			foo: [
				{
					name: "string",
					display: "string",
				},
			],
		},
		choices: {
			foo: {
				type: prismic.CustomTypeModelSliceType.Slice,
				fieldset: "string",
				description: "string",
				icon: "string",
				display: prismic.CustomTypeModelSliceDisplay.List,
				"non-repeat": {
					foo: {
						type: prismic.CustomTypeModelFieldType.Boolean,
						config: {
							label: "string",
						},
					},
				},
				repeat: {
					foo: {
						type: prismic.CustomTypeModelFieldType.Boolean,
						config: {
							label: "string",
						},
					},
				},
			},
		},
	},
});

/**
 * Supports custom Slice types.
 */
expectType<
	prismic.CustomTypeModelSliceZoneField<{
		foo: prismic.CustomTypeModelSlice;
		bar: prismic.CustomTypeModelSharedSlice;
	}>
>({
	type: prismic.CustomTypeModelFieldType.Slices,
	fieldset: "Slice zone",
	config: {
		labels: {},
		choices: {
			foo: {
				type: prismic.CustomTypeModelSliceType.Slice,
				fieldset: "string",
				display: prismic.CustomTypeModelSliceDisplay.List,
				description: "string",
				icon: "string",
				repeat: {},
				"non-repeat": {},
			},
			bar: {
				type: prismic.CustomTypeModelSliceType.SharedSlice,
			},
		},
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelSliceZoneField>(
	{} as prismicTI.CustomTypes.Widgets.Slices.SliceZone.DynamicSlices,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Slices.SliceZone.DynamicSlices>(
	{} as prismic.CustomTypeModelSliceZoneField,
);
