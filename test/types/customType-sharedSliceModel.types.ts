import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.SharedSliceModel): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

expectType<prismic.SharedSliceModel>({
	type: prismic.CustomTypeModelSliceType.SharedSlice,
	id: "string",
	name: "string",
	description: "string",
	variations: [
		{
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
		},
	],
})

/**
 * Supports custom ID.
 */
expectType<prismic.SharedSliceModel<"foo">>({
	type: prismic.CustomTypeModelSliceType.SharedSlice,
	id: "foo",
	name: "string",
	description: "string",
	variations: [],
})
expectType<prismic.SharedSliceModel<"foo">>({
	type: prismic.CustomTypeModelSliceType.SharedSlice,
	// @ts-expect-error - Slice ID must match the given ID.
	id: "string",
	name: "string",
	description: "string",
	variations: [],
})

/**
 * Supports custom variations.
 */
expectType<
	prismic.SharedSliceModel<string, prismic.SharedSliceModelVariation<"foo">>
>({
	type: prismic.CustomTypeModelSliceType.SharedSlice,
	id: "string",
	name: "string",
	description: "string",
	variations: [
		{
			id: "foo",
			name: "string",
			docURL: "string",
			version: "string",
			description: "string",
			primary: {},
			items: {},
			imageUrl: "string",
		},
		{
			// @ts-expect-error - Slice must match the given type.
			id: "bar",
			name: "string",
			docURL: "string",
			version: "string",
			description: "string",
			primary: {},
			items: {},
			imageUrl: "string",
		},
	],
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.SharedSliceModel>({} as prismicTICustomTypes.SharedSlice)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.SharedSlice>({} as prismic.SharedSliceModel)
