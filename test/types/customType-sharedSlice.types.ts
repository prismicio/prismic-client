import { expectType, expectNever } from "ts-expect";

import * as prismicTI from "@prismicio/types-internal";

import * as prismic from "../../src";

(value: prismic.CustomTypeModelSharedSlice): true => {
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

expectType<prismic.CustomTypeModelSharedSlice>({
	type: prismic.CustomTypeModelSliceType.SharedSlice,
});

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelSharedSlice>(
	{} as prismicTI.CustomTypes.Widgets.Slices.SharedSliceRef,
);

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTI.CustomTypes.Widgets.Slices.SharedSliceRef>(
	{} as prismic.CustomTypeModelSharedSlice,
);
