import { expectNever, expectType } from "ts-expect"

import * as prismic from "../../src"

;(value: prismic.EmbedField): true => {
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

/**
 * `EmbedType` keeps compatibility with other versions.
 *
 * @see Related issue {@link https://github.com/prismicio/prismic-types/issues/16}
 */
const ForeignEmbedType = {
	Link: "link",
	Breaking: "breaking",
} as const
expectType<typeof prismic.OEmbedType.Link>(ForeignEmbedType.Link)
expectType<typeof prismic.OEmbedType.Link>(
	// @ts-expect-error - `EmbedType` should still fail with breaking changes
	ForeignEmbedType.Breaking,
)

/**
 * Filled state.
 */
expectType<prismic.EmbedField>({
	embed_url: "https://example.com",
	type: prismic.OEmbedType.Link,
	version: "1.0",
	title: null,
	author_name: null,
	author_url: null,
	provider_name: null,
	provider_url: null,
	cache_age: null,
	thumbnail_url: null,
	thumbnail_width: null,
	thumbnail_height: null,
	html: null,
})
expectType<prismic.EmbedField<prismic.LinkOEmbed, "filled">>({
	embed_url: "https://example.com",
	type: prismic.OEmbedType.Link,
	version: "1.0",
	html: null,
})
expectType<prismic.EmbedField<prismic.LinkOEmbed, "empty">>({
	// @ts-expect-error - Empty fields cannot contain a filled value.
	embed_url: "https://example.com",
	// @ts-expect-error - Empty fields cannot contain a filled value.
	type: prismic.OEmbedType.Link,
	// @ts-expect-error - Empty fields cannot contain a filled value.
	version: "1.0",
	// @ts-expect-error - Empty fields cannot contain a filled value.
	html: null,
})

/**
 * Empty state.
 */
expectType<prismic.EmbedField>({})
expectType<prismic.EmbedField<prismic.AnyOEmbed, "empty">>({})
expectType<prismic.EmbedField<prismic.AnyOEmbed, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	{},
)

/**
 * Includes common oEmbed data by default.
 */
expectType<prismic.EmbedField>({
	embed_url: "https://example.com",
	type: prismic.OEmbedType.Link,
	version: "1.0",
	title: "title",
	author_name: "author_name",
	author_url: "author_url",
	provider_name: "provider_name",
	provider_url: "provider_url",
	cache_age: 42,
	thumbnail_url: "thumbnail_url",
	thumbnail_width: 666,
	thumbnail_height: 999,
	html: "html",
})

/**
 * Supports unknown keys by default.
 */
expectType<prismic.EmbedField>({
	embed_url: "https://example.com",
	type: prismic.OEmbedType.Link,
	version: "1.0",
	title: null,
	author_name: null,
	author_url: null,
	provider_name: null,
	provider_url: null,
	cache_age: null,
	thumbnail_url: null,
	thumbnail_width: null,
	thumbnail_height: null,
	html: null,
	unknown_key: "string",
})

/**
 * Supports custom oEmbed data.
 */
expectType<prismic.EmbedField<prismic.LinkOEmbed & { foo: "bar" }>>({
	embed_url: "https://example.com",
	type: prismic.OEmbedType.Link,
	version: "1.0",
	html: null,
	foo: "bar",
})

/**
 * Gives priority to custom oEmbed data.
 */
expectType<prismic.EmbedField<prismic.LinkOEmbed & { foo: "bar" }>>({
	embed_url: "https://example.com",
	type: prismic.OEmbedType.Link,
	version: "1.0",
	html: null,
	// @ts-expect-error - Now expects `foo` to be `"bar"`.
	foo: "baz",
})
