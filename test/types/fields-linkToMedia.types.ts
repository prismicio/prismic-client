import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src"

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
})
expectType<prismic.LinkToMediaField<"empty">>({
	link_type: prismic.LinkType.Media,
	// @ts-expect-error - Empty fields cannot contain a filled value.
	id: "string",
	name: "string",
	kind: "string",
	url: "string",
	size: "string",
	height: "string",
	width: "string",
})

/**
 * Empty state.
 */
expectType<prismic.LinkToMediaField>({
	link_type: prismic.LinkType.Media,
})
expectType<prismic.LinkToMediaField<"empty">>({
	link_type: prismic.LinkType.Media,
})
expectType<prismic.LinkToMediaField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Media,
	},
)
