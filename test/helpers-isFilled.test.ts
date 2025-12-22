import { describe } from "vitest"

import { it } from "./it"

import { LinkType, isFilled } from "../src"

describe("color", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(isFilled.color("#FF0000")).toBe(true)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.color(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.color(undefined)).toBe(false)
	})
})

describe("date", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(isFilled.date("2023-01-01")).toBe(true)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.date(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.date(undefined)).toBe(false)
	})
})

describe("embed", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(
			isFilled.embed({
				type: "link",
				embed_url: "https://example.org",
				version: "1",
				html: "",
			}),
		).toBe(true)
	})

	it("returns false for empty object", async ({ expect }) => {
		expect(isFilled.embed({})).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.embed(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.embed(undefined)).toBe(false)
	})
})

describe("geoPoint", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(isFilled.geoPoint({ latitude: 0, longitude: 0 })).toBe(true)
	})

	it("returns false for empty object", async ({ expect }) => {
		expect(isFilled.geoPoint({})).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.geoPoint(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.geoPoint(undefined)).toBe(false)
	})
})

describe("group", () => {
	it("returns true for non-empty array", async ({ expect }) => {
		expect(isFilled.group([{ foo: "bar" }])).toBe(true)
	})

	it("returns false for empty array", async ({ expect }) => {
		expect(isFilled.group([])).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.group(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.group(undefined)).toBe(false)
	})
})

describe("image", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(
			isFilled.image({
				id: "id",
				url: "https://example.org/image.jpg",
				alt: null,
				copyright: null,
				dimensions: { width: 1, height: 1 },
				edit: {
					x: 0,
					y: 0,
					zoom: 1,
					background: "background",
				},
			}),
		).toBe(true)
	})

	it("returns false for empty object", async ({ expect }) => {
		expect(isFilled.image({})).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.image(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.image(undefined)).toBe(false)
	})
})

describe("imageThumbnail", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(
			isFilled.imageThumbnail({
				id: "id",
				url: "https://example.org/image.jpg",
				alt: null,
				copyright: null,
				dimensions: { width: 1, height: 1 },
				edit: {
					x: 0,
					y: 0,
					zoom: 1,
					background: "background",
				},
			}),
		).toBe(true)
	})

	it("returns false for empty object", async ({ expect }) => {
		expect(isFilled.imageThumbnail({})).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.imageThumbnail(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.imageThumbnail(undefined)).toBe(false)
	})
})

describe("integration", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(isFilled.integration({ id: "foo" })).toBe(true)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.integration(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.integration(undefined)).toBe(false)
	})

	it("integrationField is alias for integration", async ({ expect }) => {
		expect(isFilled.integrationField).toBe(isFilled.integration)
	})

	it("integrationFields is alias for integration", async ({ expect }) => {
		expect(isFilled.integrationFields).toBe(isFilled.integration)
	})
})

describe("keyText", () => {
	it("returns true for non-empty string", async ({ expect }) => {
		expect(isFilled.keyText("text")).toBe(true)
	})

	it("returns false for empty string", async ({ expect }) => {
		expect(isFilled.keyText("")).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.keyText(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.keyText(undefined)).toBe(false)
	})
})

describe("link", () => {
	it("returns true for filled link", async ({ expect }) => {
		expect(
			isFilled.link({
				link_type: LinkType.Web,
				url: "https://example.org",
			}),
		).toBe(true)
	})

	it("returns false for empty link", async ({ expect }) => {
		expect(isFilled.link({ link_type: LinkType.Any })).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.link(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.link(undefined)).toBe(false)
	})
})

describe("linkToMedia", () => {
	it("returns true for filled link", async ({ expect }) => {
		expect(
			isFilled.linkToMedia({
				link_type: LinkType.Media,
				id: "foo",
				url: "https://example.org",
				name: "name",
				kind: "kind",
				size: "size",
			}),
		).toBe(true)
	})

	it("returns false for empty link", async ({ expect }) => {
		expect(isFilled.linkToMedia({ link_type: LinkType.Any })).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.linkToMedia(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.linkToMedia(undefined)).toBe(false)
	})
})

describe("number", () => {
	it("returns true for number", async ({ expect }) => {
		expect(isFilled.number(42)).toBe(true)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.number(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.number(undefined)).toBe(false)
	})
})

describe("richText", () => {
	it("returns true for filled content", async ({ expect }) => {
		expect(
			isFilled.richText([{ type: "paragraph", text: "text", spans: [] }]),
		).toBe(true)
	})

	it("returns false for empty paragraph", async ({ expect }) => {
		expect(
			isFilled.richText([{ type: "paragraph", text: "", spans: [] }]),
		).toBe(false)
	})

	it("returns false for empty array", async ({ expect }) => {
		expect(isFilled.richText([])).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.richText(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.richText(undefined)).toBe(false)
	})
})

describe("select", () => {
	it("returns true for filled value", async ({ expect }) => {
		expect(isFilled.select("option")).toBe(true)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.select(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.select(undefined)).toBe(false)
	})
})

describe("sliceZone", () => {
	it("returns true for non-empty array", async ({ expect }) => {
		expect(
			isFilled.sliceZone([
				{
					id: "id",
					slice_type: "foo",
					slice_label: "label",
					primary: {},
					items: [],
				},
			]),
		).toBe(true)
	})

	it("returns false for empty array", async ({ expect }) => {
		expect(isFilled.sliceZone([])).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.sliceZone(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.sliceZone(undefined)).toBe(false)
	})
})

describe("table", () => {
	it("returns true for filled table", async ({ expect }) => {
		expect(
			isFilled.table({
				body: {
					rows: [
						{
							cells: [
								{
									type: "data",
									content: [{ type: "paragraph", text: "text", spans: [] }],
									key: "key",
								},
							],
							key: "key",
						},
					],
				},
			}),
		).toBe(true)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.table(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.table(undefined)).toBe(false)
	})
})

describe("timestamp", () => {
	it("returns true for filled timestamp", async ({ expect }) => {
		expect(isFilled.timestamp("2023-01-01T00:00:00Z")).toBe(true)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.timestamp(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.timestamp(undefined)).toBe(false)
	})
})

describe("title", () => {
	it("returns true for filled text", async ({ expect }) => {
		expect(
			isFilled.title([{ type: "heading1", text: "text", spans: [] }]),
		).toBe(true)
	})

	it("returns false for empty text", async ({ expect }) => {
		expect(isFilled.title([{ type: "heading1", text: "", spans: [] }])).toBe(
			false,
		)
	})

	it("returns false for empty array", async ({ expect }) => {
		expect(isFilled.title([])).toBe(false)
	})

	it("returns false for null", async ({ expect }) => {
		expect(isFilled.title(null)).toBe(false)
	})

	it("returns false for undefined", async ({ expect }) => {
		expect(isFilled.title(undefined)).toBe(false)
	})
})
