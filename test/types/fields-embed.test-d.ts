import { assertType, it } from "vitest"

import type { AnyOEmbed, EmbedField, LinkOEmbed, OEmbedType } from "../../src"

it("supports filled values", () => {
	assertType<EmbedField>({
		embed_url: "https://example.com",
		type: "link",
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
	assertType<EmbedField<LinkOEmbed, "filled">>({
		embed_url: "https://example.com",
		type: "link",
		version: "1.0",
		html: null,
	})
	assertType<EmbedField<LinkOEmbed, "filled">>(
		// @ts-expect-error - Filled fields cannot contain an empty value.
		{},
	)
})

it("supports empty values", () => {
	assertType<EmbedField>({})
	assertType<EmbedField<AnyOEmbed, "empty">>({})
	assertType<EmbedField<AnyOEmbed, "empty">>({
		// @ts-expect-error - Empty fields cannot contain a filled value.
		embed_url: "https://example.com",
		// @ts-expect-error - Empty fields cannot contain a filled value.
		type: "link",
		// @ts-expect-error - Empty fields cannot contain a filled value.
		version: "1.0",
		// @ts-expect-error - Empty fields cannot contain a filled value.
		html: null,
	})
})

it("supports common oEmbed data", () => {
	assertType<EmbedField>({
		embed_url: "https://example.com",
		type: "link",
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
})

it("supports unknown keys", () => {
	assertType<EmbedField>({
		embed_url: "https://example.com",
		type: "link",
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
})

it("supports custom oEmbed data", () => {
	assertType<EmbedField<LinkOEmbed & { foo: "bar" }>>({
		embed_url: "https://example.com",
		type: "link",
		version: "1.0",
		html: null,
		foo: "bar",
	})
})

it("prioritizes custom oEmbed data", () => {
	assertType<EmbedField<LinkOEmbed & { foo: "bar" }>>({
		embed_url: "https://example.com",
		type: "link",
		version: "1.0",
		html: null,
		// @ts-expect-error - Now expects `foo` to be `"bar"`.
		foo: "baz",
	})
})

it("uses const object (not enum) to allow cross-version compatibility", () => {
	// Compatible literal values work (would fail if OEmbedType was an enum)
	assertType<typeof OEmbedType.Link>("link")
	// @ts-expect-error - Incompatible values still fail.
	assertType<typeof OEmbedType.Link>("breaking")
})
