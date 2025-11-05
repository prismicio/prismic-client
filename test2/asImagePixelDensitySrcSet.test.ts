import { it } from "./it"

import type { ImageField } from "../src"
import { asImagePixelDensitySrcSet } from "../src"

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

it("returns a srcset with default pixel densities", async ({ expect }) => {
	const res = asImagePixelDensitySrcSet(field)
	expect(res).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&dpr=1 1x, ` +
			`${field.url}&dpr=2 2x, ` +
			`${field.url}&dpr=3 3x`,
	})
})

it("supports custom pixel densities", async ({ expect }) => {
	const res = asImagePixelDensitySrcSet(field, {
		pixelDensities: [2, 4, 6],
	})
	expect(res).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&dpr=2 2x, ` +
			`${field.url}&dpr=4 4x, ` +
			`${field.url}&dpr=6 6x`,
	})
})

it("supports imgix params", async ({ expect }) => {
	const res = asImagePixelDensitySrcSet(field, { sat: 100 })
	expect(res.src).toHaveSearchParam("sat", "100")
	res.srcset.split(", ").forEach((src) => {
		expect(src).toHaveSearchParam("sat", "100")
	})
})

it("returns null for empty image field", async ({ expect }) => {
	const res = asImagePixelDensitySrcSet({})
	expect(res).toBeNull()
})

it("returns null for null input", async ({ expect }) => {
	const res = asImagePixelDensitySrcSet(null)
	expect(res).toBeNull()
})

it("returns null for undefined input", async ({ expect }) => {
	const res = asImagePixelDensitySrcSet(undefined)
	expect(res).toBeNull()
})
