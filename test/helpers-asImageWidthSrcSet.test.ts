import { it } from "./it"

import type { ImageField } from "../src"
import { asImageWidthSrcSet } from "../src"

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

const fieldWithThumbnails: ImageField<"foo" | "bar"> = {
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
	dimensions: { width: 1000, height: 800 },
	foo: {
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
		dimensions: { width: 500, height: 400 },
	},
	bar: {
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
		dimensions: { width: 250, height: 200 },
	},
}

it("returns a srcset with default widths", async ({ expect }) => {
	const res = asImageWidthSrcSet(field)
	expect(res).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=640 640w, ` +
			`${field.url}&width=828 828w, ` +
			`${field.url}&width=1200 1200w, ` +
			`${field.url}&width=2048 2048w, ` +
			`${field.url}&width=3840 3840w`,
	})
})

it("supports custom widths", async ({ expect }) => {
	const res = asImageWidthSrcSet(field, { widths: [400, 800, 1600] })
	expect(res).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=400 400w, ` +
			`${field.url}&width=800 800w, ` +
			`${field.url}&width=1600 1600w`,
	})
})

it("supports imgix params", async ({ expect }) => {
	const res = asImageWidthSrcSet(field, { sat: 100 })
	expect(res.src).toHaveSearchParam("sat", "100")
	res.srcset.split(", ").forEach((src) => {
		expect(src).toHaveSearchParam("sat", "100")
	})
})

it("uses responsive views when widths is thumbnails", async ({ expect }) => {
	const res = asImageWidthSrcSet(fieldWithThumbnails, { widths: "thumbnails" })
	expect(res).toStrictEqual({
		src: fieldWithThumbnails.url,
		srcset:
			`${fieldWithThumbnails.url}&width=1000 1000w, ` +
			`${fieldWithThumbnails.foo.url}&width=500 500w, ` +
			`${fieldWithThumbnails.bar.url}&width=250 250w`,
	})
})

it("uses default widths when widths is thumbnails but field has no responsive views", async ({
	expect,
}) => {
	const res = asImageWidthSrcSet(field, { widths: "thumbnails" })
	expect(res).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=640 640w, ` +
			`${field.url}&width=828 828w, ` +
			`${field.url}&width=1200 1200w, ` +
			`${field.url}&width=2048 2048w, ` +
			`${field.url}&width=3840 3840w`,
	})
})

it("ignores responsive views when custom widths are provided", async ({
	expect,
}) => {
	const res = asImageWidthSrcSet(fieldWithThumbnails, {
		widths: [400, 800, 1600],
	})
	expect(res).toStrictEqual({
		src: fieldWithThumbnails.url,
		srcset:
			`${field.url}&width=400 400w, ` +
			`${field.url}&width=800 800w, ` +
			`${field.url}&width=1600 1600w`,
	})
})

it("returns null for empty image field", async ({ expect }) => {
	const res = asImageWidthSrcSet({})
	expect(res).toBeNull()
})

it("returns null for null input", async ({ expect }) => {
	const res = asImageWidthSrcSet(null)
	expect(res).toBeNull()
})

it("returns null for undefined input", async ({ expect }) => {
	const res = asImageWidthSrcSet(undefined)
	expect(res).toBeNull()
})
