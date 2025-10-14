import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src/index.ts"

;(value: prismic.LinkToMediaField): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				return expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

/**
 * Filled state.
 */
expectType<prismic.LinkToMediaField>({
	id: "string",
	link_type: prismic.LinkType.Media,
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
	text: "string",
	variant: "string",
})
expectType<prismic.LinkToMediaField<"filled">>({
	id: "string",
	link_type: prismic.LinkType.Media,
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
	text: "string",
	variant: "string",
})
expectType<prismic.LinkToMediaField<"empty">>({
	link_type: prismic.LinkType.Any,
	// @ts-expect-error - Empty fields cannot contain a filled value.
	id: "string",
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
	text: "string",
	variant: "string",
})

/**
 * Empty state.
 */
expectType<prismic.LinkToMediaField>({
	link_type: prismic.LinkType.Any,
})
expectType<prismic.LinkToMediaField<"empty">>({
	link_type: prismic.LinkType.Any,
})
expectType<prismic.LinkToMediaField<"filled">>({
	// @ts-expect-error - Filled fields cannot contain an empty value.
	link_type: prismic.LinkType.Any,
})

/**
 * Empty state with text.
 */
expectType<prismic.LinkToMediaField>({
	link_type: prismic.LinkType.Any,
	text: "string",
	variant: "string",
})
expectType<prismic.LinkToMediaField<"empty">>({
	link_type: prismic.LinkType.Any,
	text: "string",
	variant: "string",
})
expectType<prismic.LinkToMediaField<"filled">>({
	// @ts-expect-error - Filled fields cannot contain an empty value.
	link_type: prismic.LinkType.Any,
	text: "string",
	variant: "string",
})
