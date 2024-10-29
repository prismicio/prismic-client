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
 * Filled state (non-repeatable).
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
	text: "string",
})

/**
 * Filled state (repeatable).
 */
expectType<prismic.LinkToMediaField>([
	{
		id: "string",
		link_type: prismic.LinkType.Media,
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
	},
])
expectType<prismic.LinkToMediaField<"filled">>([
	{
		id: "string",
		link_type: prismic.LinkType.Media,
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
	},
])
expectType<prismic.LinkToMediaField<"empty">>([
	// @ts-expect-error - Empty repeatable fields cannot contain a value.
	{
		link_type: prismic.LinkType.Media,
		id: "string",
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
	},
])

/**
 * Empty state (non-repeatable).
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

/**
 * Empty state (repeatable).
 */
expectType<prismic.LinkToMediaField>([
	{
		link_type: prismic.LinkType.Media,
	},
])
expectType<prismic.LinkToMediaField<"empty">>([])
expectType<prismic.LinkToMediaField<"empty">>([
	// @ts-expect-error - Empty repeatable fields cannot contain a value.
	{
		link_type: prismic.LinkType.Media,
	},
])

/**
 * Empty state with text (non-repeatable).
 */
expectType<prismic.LinkToMediaField>({
	link_type: prismic.LinkType.Media,
	text: "string",
})
expectType<prismic.LinkToMediaField<"empty">>({
	link_type: prismic.LinkType.Media,
	text: "string",
})
expectType<prismic.LinkToMediaField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{
		link_type: prismic.LinkType.Media,
		text: "string",
	},
)

/**
 * Empty state with text (repeatable).
 */
expectType<prismic.LinkToMediaField>([
	{
		link_type: prismic.LinkType.Media,
		text: "string",
	},
])
expectType<prismic.LinkToMediaField<"filled">>([
	{
		link_type: prismic.LinkType.Media,
		text: "string",
	},
])
