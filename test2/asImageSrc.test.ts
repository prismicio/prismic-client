import { it } from "./it"

import { asImageSrc } from "../src"

const field = {
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

it("returns the image field URL", async ({ expect }) => {
	const res = asImageSrc(field)
	expect(res).toBe(field.url)
})

it("applies given Imgix URL parameters", async ({ expect }) => {
	const res = asImageSrc(field, { sat: 100 })
	expect(res).toHaveSearchParam("sat", "100")
})

it("returns null for empty image field", async ({ expect }) => {
	const res = asImageSrc({})
	expect(res).toBeNull()
})

it("returns null for null input", async ({ expect }) => {
	const res = asImageSrc(null)
	expect(res).toBeNull()
})

it("returns null for undefined input", async ({ expect }) => {
	const res = asImageSrc(undefined)
	expect(res).toBeNull()
})
