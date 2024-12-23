import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"

;(value: prismic.CustomTypeModelContentRelationshipField): true => {
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

expectType<prismic.CustomTypeModelContentRelationshipField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		select: prismic.CustomTypeModelLinkSelectType.Document,
	},
})

/**
 * Supports optional placeholder.
 */
expectType<prismic.CustomTypeModelContentRelationshipField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		placeholder: "string",
		select: prismic.CustomTypeModelLinkSelectType.Document,
	},
})

/**
 * Supports optional `customtypes` property.
 */
expectType<prismic.CustomTypeModelContentRelationshipField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		select: prismic.CustomTypeModelLinkSelectType.Document,
		customtypes: ["string"],
	},
})

/**
 * Supports custom `customtypes` values.
 */
expectType<prismic.CustomTypeModelContentRelationshipField<"foo">>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		select: prismic.CustomTypeModelLinkSelectType.Document,
		customtypes: [
			"foo",
			// @ts-expect-error - Only given types are valid.
			"bar",
		],
	},
})

/**
 * Supports optional `tags` property.
 */
expectType<prismic.CustomTypeModelContentRelationshipField>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		select: prismic.CustomTypeModelLinkSelectType.Document,
		tags: ["string"],
	},
})

/**
 * Supports custom `tags` values.
 */
expectType<prismic.CustomTypeModelContentRelationshipField<string, "foo">>({
	type: prismic.CustomTypeModelFieldType.Link,
	config: {
		label: "string",
		select: prismic.CustomTypeModelLinkSelectType.Document,
		tags: [
			"foo",
			// @ts-expect-error - Only given tags are valid.
			"bar",
		],
	},
})

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModelContentRelationshipField>(
	{} as prismicTICustomTypes.Link & {
		// We must manually narrow `@prismicio/types-internal`'s type
		// to match a Content Relationship field;
		// `@prismicio/types-internal` does not contain a Content
		// Relationship-specific type.
		config?: { select: "document" }
	},
)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.Link>(
	{} as prismic.CustomTypeModelContentRelationshipField,
)
