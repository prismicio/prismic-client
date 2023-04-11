import * as prismicTI from "@prismicio/types-internal";
import { expectNever, expectType } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelGeoPointField): true => {
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

expectType<prismic.CustomTypeModelGeoPointField>({
	type: prismic.CustomTypeModelFieldType.GeoPoint,
	config: {
		label: "string",
	},
});

/**
 * Does not support a placeholder.
 */
expectType<prismic.CustomTypeModelGeoPointField>({
	type: prismic.CustomTypeModelFieldType.GeoPoint,
	config: {
		label: "string",
		// @ts-expect-error - Does not support a placeholder.
		placeholder: "string",
	},
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelGeoPointField>(
	{} as prismicTI.CustomTypes.Widgets.Nestable.GeoPoint,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Nestable.GeoPoint>(
	{} as prismic.CustomTypeModelGeoPointField,
);
