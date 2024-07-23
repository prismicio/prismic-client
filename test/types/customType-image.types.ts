import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelImageField): true => {
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

expectType<prismic.CustomTypeModelImageField>({
	type: prismic.CustomTypeModelFieldType.Image,
	config: {
		label: "string",
		constraint: {},
		thumbnails: [
			{
				name: "string",
				width: 1,
				height: 1,
			},
		],
	},
})

/**
 * Does not support a placeholder.
 */
expectType<prismic.CustomTypeModelImageField>({
	type: prismic.CustomTypeModelFieldType.Image,
	config: {
		label: "string",
		// @ts-expect-error - Does not support a placeholder.
		placeholder: "string",
		constraint: {
			width: 1,
			height: 1,
		},
		thumbnails: [
			{
				name: "string",
				width: 1,
				height: 1,
			},
		],
	},
})

/**
 * Supports optional constraint.
 */
expectType<prismic.CustomTypeModelImageField>({
	type: prismic.CustomTypeModelFieldType.Image,
	config: {
		label: "string",
		constraint: {
			width: 1,
			height: 1,
		},
		thumbnails: [],
	},
})

/**
 * Supports custom thumbnail names.
 */
expectType<prismic.CustomTypeModelImageField<"Foo">>({
	type: prismic.CustomTypeModelFieldType.Image,
	config: {
		label: "string",
		constraint: {},
		thumbnails: [
			{
				name: "Foo",
				width: 1,
				height: 1,
			},
			{
				// @ts-expect-error - Only given thumbnail names are valid.
				name: "string",
				width: 1,
				height: 1,
			},
		],
	},
})

/**
 * Constraint supports nullable width and height to represent no constraint.
 */
expectType<prismic.CustomTypeModelImageConstraint>({
	width: null,
	height: null,
})
expectType<prismic.CustomTypeModelImageConstraint>({
	width: 1,
	height: null,
})
expectType<prismic.CustomTypeModelImageConstraint>({
	width: null,
	height: 1,
})

/**
 * Thumbnail supports configurable name.
 */
expectType<prismic.CustomTypeModelImageThumbnail<"Foo">>({
	name: "Foo",
	width: null,
	height: null,
})
expectType<prismic.CustomTypeModelImageThumbnail<"Foo">>({
	// @ts-expect-error - Name must match the given name.
	name: "string",
	width: null,
	height: null,
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelImageField>({} as prismicTICustomTypes.Image)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.Image>({} as prismic.CustomTypeModelImageField)
