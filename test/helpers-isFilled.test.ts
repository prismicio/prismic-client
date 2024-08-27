import { expect, it } from "vitest"

import { documentFixture } from "./__fixtures__/document"

import type { GroupField, SliceZone } from "../src"
import { isFilled } from "../src"

it("color", (ctx) => {
	expect(isFilled.color(null)).toBe(false)
	expect(isFilled.color(undefined)).toBe(false)
	expect(isFilled.color(ctx.mock.value.color())).toBe(true)
})

it("content relationship", (ctx) => {
	expect(isFilled.contentRelationship(null)).toBe(false)
	expect(isFilled.contentRelationship(undefined)).toBe(false)
	expect(
		isFilled.contentRelationship(
			ctx.mock.value.contentRelationship({
				state: "empty",
			}),
		),
	).toBe(false)
	expect(
		isFilled.contentRelationship(
			ctx.mock.value.contentRelationship({
				state: "filled",
			}),
		),
	).toBe(true)
})

it("date", (ctx) => {
	expect(isFilled.date(null)).toBe(false)
	expect(isFilled.date(undefined)).toBe(false)
	expect(isFilled.date(ctx.mock.value.date())).toBe(true)
})

it("embed", (ctx) => {
	expect(isFilled.embed(null)).toBe(false)
	expect(isFilled.embed(undefined)).toBe(false)
	expect(isFilled.embed({})).toBe(false)
	expect(isFilled.embed(ctx.mock.value.embed())).toBe(true)
})

it("geopoint", (ctx) => {
	expect(isFilled.geoPoint(null)).toBe(false)
	expect(isFilled.geoPoint(undefined)).toBe(false)
	expect(isFilled.geoPoint({})).toBe(false)
	expect(isFilled.geoPoint(ctx.mock.value.geoPoint())).toBe(true)
})

it("group", (ctx) => {
	expect(isFilled.group(null)).toBe(false)
	expect(isFilled.group(undefined)).toBe(false)
	expect(isFilled.group([])).toBe(false)
	expect(isFilled.group(ctx.mock.value.group() as GroupField)).toBe(true)
})

it("image", (ctx) => {
	expect(isFilled.image(null)).toBe(false)
	expect(isFilled.image(undefined)).toBe(false)
	expect(isFilled.image({})).toBe(false)
	expect(isFilled.image(ctx.mock.value.image())).toBe(true)
})

it("image thumbnail", () => {
	expect(isFilled.imageThumbnail(null)).toBe(false)
	expect(isFilled.imageThumbnail(undefined)).toBe(false)
	expect(isFilled.imageThumbnail({})).toBe(false)
	expect(
		isFilled.imageThumbnail({
			id: "id",
			edit: {
				x: 0,
				y: 0,
				zoom: 1,
				background: "background",
			},
			url: "url",
			alt: null,
			copyright: null,
			dimensions: { width: 1, height: 1 },
		}),
	).toBe(true)
})

it("integration fields", (ctx) => {
	expect(isFilled.integrationField(null)).toBe(false)
	expect(isFilled.integrationField(undefined)).toBe(false)
	expect(isFilled.integrationField(ctx.mock.value.integration())).toBe(true)
})
it("aliases integrationFields to integrationField", () => {
	expect(isFilled.integrationField).toBe(isFilled.integrationField)
})

it("key text", (ctx) => {
	expect(isFilled.keyText(null)).toBe(false)
	expect(isFilled.keyText(undefined)).toBe(false)
	expect(isFilled.keyText("")).toBe(false)
	expect(isFilled.keyText(ctx.mock.value.keyText())).toBe(true)
})

it("link", (ctx) => {
	expect(isFilled.link(null)).toBe(false)
	expect(isFilled.link(undefined)).toBe(false)
	expect(isFilled.link(ctx.mock.value.link({ state: "empty" }))).toBe(false)
	expect(isFilled.link(ctx.mock.value.link({ state: "filled" }))).toBe(true)
})

it("link to media", (ctx) => {
	expect(isFilled.linkToMedia(null)).toBe(false)
	expect(isFilled.linkToMedia(undefined)).toBe(false)
	expect(
		isFilled.linkToMedia(ctx.mock.value.linkToMedia({ state: "empty" })),
	).toBe(false)
	expect(
		isFilled.linkToMedia(ctx.mock.value.linkToMedia({ state: "filled" })),
	).toBe(true)
})

it("number", (ctx) => {
	expect(isFilled.number(null)).toBe(false)
	expect(isFilled.number(undefined)).toBe(false)
	expect(isFilled.number(ctx.mock.value.number())).toBe(true)
})

it("rich text", (ctx) => {
	expect(isFilled.richText(null)).toBe(false)
	expect(isFilled.richText(undefined)).toBe(false)
	expect(isFilled.richText([])).toBe(false)
	expect(isFilled.richText([{ type: "paragraph", text: "", spans: [] }])).toBe(
		false,
	)
	expect(isFilled.richText(ctx.mock.value.richText())).toBe(true)
})

it("select", (ctx) => {
	expect(isFilled.select(null)).toBe(false)
	expect(isFilled.select(undefined)).toBe(false)
	expect(
		isFilled.select(
			ctx.mock.value.select({
				model: ctx.mock.model.select({
					options: ["foo", "bar"],
				}),
			}),
		),
	).toBe(true)
})

it("slice zone", (ctx) => {
	expect(isFilled.sliceZone(null)).toBe(false)
	expect(isFilled.sliceZone(undefined)).toBe(false)
	expect(isFilled.sliceZone([])).toBe(false)
	expect(
		isFilled.sliceZone(
			ctx.mock.value.sliceZone({
				model: ctx.mock.model.sliceZone({
					choices: {
						Foo: ctx.mock.model.slice(),
						Bar: ctx.mock.model.slice(),
					},
				}),
			}) as SliceZone,
		),
	).toBe(true)
})

it("timestamp", (ctx) => {
	expect(isFilled.timestamp(null)).toBe(false)
	expect(isFilled.timestamp(undefined)).toBe(false)
	expect(isFilled.timestamp(ctx.mock.value.timestamp())).toBe(true)
	expect(isFilled.timestamp(documentFixture.empty.first_publication_date)).toBe(
		true,
	)
	expect(isFilled.timestamp(documentFixture.empty.last_publication_date)).toBe(
		true,
	)
})

it("title", (ctx) => {
	expect(isFilled.title(null)).toBe(false)
	expect(isFilled.title(undefined)).toBe(false)
	expect(isFilled.title([])).toBe(false)
	expect(isFilled.title([{ type: "heading1", text: "", spans: [] }])).toBe(
		false,
	)
	expect(isFilled.title(ctx.mock.value.title())).toBe(true)
})
