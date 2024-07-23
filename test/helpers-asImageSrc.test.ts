import { expect, it } from "vitest"

import type { ImageField } from "../src"
import { asImageSrc } from "../src"

it("returns null for nullish inputs", () => {
	expect(asImageSrc(null)).toBeNull()
	expect(asImageSrc(undefined)).toBeNull()
})

it("returns an image field URL", () => {
	const field: ImageField = {
		id: "id",
		edit: {
			x: 0,
			y: 0,
			zoom: 1,
			background: "background",
		},
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 400, height: 300 },
	}

	expect(asImageSrc(field)).toBe(field.url)
})

it("applies given Imgix URL parameters", () => {
	const field: ImageField = {
		id: "id",
		edit: {
			x: 0,
			y: 0,
			zoom: 1,
			background: "background",
		},
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 400, height: 300 },
	}

	expect(asImageSrc(field, { sat: 100 })).toBe(`${field.url}&sat=100`)
	expect(asImageSrc(field, { w: 100 })).toBe(`${field.url}&w=100`)
	expect(asImageSrc(field, { width: 100 })).toBe(`${field.url}&width=100`)
})

it("returns null when image field is empty", () => {
	const field: ImageField<null, "empty"> = {}

	expect(asImageSrc(field)).toBeNull()
})
