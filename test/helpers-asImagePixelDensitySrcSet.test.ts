import { expect, it } from "vitest"

import type { ImageField } from "../src"
import { asImagePixelDensitySrcSet } from "../src"

it("returns null for nullish inputs", () => {
	expect(asImagePixelDensitySrcSet(null)).toBeNull()
	expect(asImagePixelDensitySrcSet(undefined)).toBeNull()
})

it("returns an image field pixel-density-based srcset with [1, 2, 3] pxiel densities by default", () => {
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

	expect(asImagePixelDensitySrcSet(field)).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&dpr=1 1x, ` +
			`${field.url}&dpr=2 2x, ` +
			`${field.url}&dpr=3 3x`,
	})
})

it("supports custom pixel densities", () => {
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

	expect(
		asImagePixelDensitySrcSet(field, {
			pixelDensities: [2, 4, 6],
		}),
	).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&dpr=2 2x, ` +
			`${field.url}&dpr=4 4x, ` +
			`${field.url}&dpr=6 6x`,
	})
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

	expect(
		asImagePixelDensitySrcSet(field, {
			sat: 100,
		}),
	).toStrictEqual({
		src: `${field.url}&sat=100`,
		srcset:
			`${field.url}&sat=100&dpr=1 1x, ` +
			`${field.url}&sat=100&dpr=2 2x, ` +
			`${field.url}&sat=100&dpr=3 3x`,
	})
})

it("returns null when image field is empty", () => {
	const field: ImageField<null, "empty"> = {}

	expect(asImagePixelDensitySrcSet(field)).toBeNull()
})
