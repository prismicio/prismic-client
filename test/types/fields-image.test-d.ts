import { assertType, it } from "vitest"

import type { ImageField } from "../../src"

it("supports filled values", () => {
	assertType<ImageField>({
		id: "id",
		url: "url",
		dimensions: { width: 1, height: 1 },
		edit: { x: 0, y: 0, zoom: 1, background: "background" },
		alt: "alt",
		copyright: "copyright",
	})
	assertType<ImageField<never, "filled">>({
		id: "id",
		url: "url",
		dimensions: { width: 1, height: 1 },
		edit: { x: 0, y: 0, zoom: 1, background: "background" },
		alt: "alt",
		copyright: "copyright",
	})
	assertType<ImageField<never, "filled">>(
		// @ts-expect-error - Filled fields cannot contain an empty value.
		{
			url: null,
			dimensions: null,
			alt: null,
			copyright: null,
		},
	)
})

it("supports empty values", () => {
	assertType<ImageField>({
		url: null,
		dimensions: null,
		alt: null,
		copyright: null,
	})
	assertType<ImageField>({})
	assertType<ImageField<never, "empty">>({
		url: null,
		dimensions: null,
		alt: null,
		copyright: null,
	})
})

it("supports null alt and copyright", () => {
	assertType<ImageField>({
		id: "id",
		url: "url",
		dimensions: { width: 1, height: 1 },
		edit: { x: 0, y: 0, zoom: 1, background: "background" },
		alt: null,
		copyright: null,
	})
})

it("does not contain thumbnails by default", () => {
	assertType<ImageField>({
		url: "url",
		dimensions: { width: 1, height: 1 },
		alt: "alt",
		copyright: "copyright",
		// @ts-expect-error - No thumbnails are included by default.
		Foo: {},
	})
})

it("supports thumbnails", () => {
	assertType<ImageField<"Foo" | "Bar">>({
		id: "id",
		url: "url",
		dimensions: { width: 1, height: 1 },
		edit: { x: 0, y: 0, zoom: 1, background: "background" },
		alt: "alt",
		copyright: "copyright",
		Foo: {
			id: "id",
			url: "url",
			dimensions: { width: 1, height: 1 },
			edit: { x: 0, y: 0, zoom: 1, background: "background" },
			alt: "alt",
			copyright: "copyright",
		},
		Bar: {
			id: "id",
			url: "url",
			dimensions: { width: 1, height: 1 },
			edit: { x: 0, y: 0, zoom: 1, background: "background" },
			alt: "alt",
			copyright: "copyright",
		},
	})
})

it("supports disabling thumbnails with never", () => {
	assertType<ImageField<never>>({
		url: "url",
		dimensions: { width: 1, height: 1 },
		alt: null,
		copyright: null,
		// @ts-expect-error - No thumbnails should be included when set to `never`.
		Foo: {
			url: "url",
			dimensions: { width: 1, height: 1 },
			alt: "alt",
			copyright: "copyright",
		},
	})
})

it("supports thumbnail name 'length'", () => {
	assertType<ImageField>({
		url: "url",
		dimensions: { width: 1, height: 1 },
		alt: "alt",
		copyright: "copyright",
		// @ts-expect-error - `"length"` shouldn't be available as a thumbnail name by default
		length: {
			url: "url",
			dimensions: { width: 1, height: 1 },
			alt: "alt",
			copyright: "copyright",
		},
	})
	assertType<ImageField<"length">>({
		id: "id",
		url: "url",
		dimensions: { width: 1, height: 1 },
		edit: { x: 0, y: 0, zoom: 1, background: "background" },
		alt: "alt",
		copyright: "copyright",
		length: {
			id: "id",
			url: "url",
			dimensions: { width: 1, height: 1 },
			edit: { x: 0, y: 0, zoom: 1, background: "background" },
			alt: "alt",
			copyright: "copyright",
		},
	})
})
