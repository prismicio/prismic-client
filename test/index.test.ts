import { expect, it } from "vitest"

import * as prismic from "../src"

it("rich text node type mapping", () => {
	expect(prismic.RichTextNodeType).toMatchObject({
		heading1: "heading1",
		heading2: "heading2",
		heading3: "heading3",
		heading4: "heading4",
		heading5: "heading5",
		heading6: "heading6",
		paragraph: "paragraph",
		preformatted: "preformatted",
		strong: "strong",
		em: "em",
		listItem: "list-item",
		oListItem: "o-list-item",
		list: "group-list-item",
		oList: "group-o-list-item",
		image: "image",
		embed: "embed",
		hyperlink: "hyperlink",
		label: "label",
		span: "span",
	})
})

it("link type mapping", () => {
	expect(prismic.LinkType).toMatchObject({
		Any: "Any",
		Web: "Web",
		Media: "Media",
		Document: "Document",
	})
})

it("embed type mapping", () => {
	expect(prismic.OEmbedType).toMatchObject({
		Photo: "photo",
		Video: "video",
		Link: "link",
		Rich: "rich",
	})
})

it("custom type field type mapping", () => {
	expect(prismic.CustomTypeModelFieldType).toStrictEqual({
		Boolean: "Boolean",
		Color: "Color",
		Date: "Date",
		Embed: "Embed",
		GeoPoint: "GeoPoint",
		Group: "Group",
		Image: "Image",
		Integration: "IntegrationFields",
		Link: "Link",
		Number: "Number",
		Select: "Select",
		Slices: "Slices",
		StructuredText: "StructuredText",
		Text: "Text",
		Timestamp: "Timestamp",
		UID: "UID",
		// Deprecated fields
		IntegrationFields: "IntegrationFields",
		Range: "Range",
		Separator: "Separator",
		LegacySlices: "Choice",
	})
})

it("custom type link select mapping", () => {
	expect(prismic.CustomTypeModelLinkSelectType).toMatchObject({
		Document: "document",
		Media: "media",
	})
})

it("custom type slice display mapping", () => {
	expect(prismic.CustomTypeModelSliceDisplay).toMatchObject({
		Grid: "grid",
		List: "list",
	})
})

it("custom type slice type mapping", () => {
	expect(prismic.CustomTypeModelSliceType).toMatchObject({
		Slice: "Slice",
		SharedSlice: "SharedSlice",
	})
})

it("webhook type mapping", () => {
	expect(prismic.WebhookType).toMatchObject({
		APIUpdate: "api-update",
		TestTrigger: "test-trigger",
	})
})

// TODO: Remove when we remove support for deprecated `predicate` export.
it("predicate is a temporary alias for filter", () => {
	expect(prismic.predicate).toStrictEqual(prismic.filter)
})

// TODO: Remove when we remove support for deprecated `unstable_mapSliceZone` export.
it("unstable_mapSliceZone is a temporary alias for mapSliceZone", () => {
	expect(prismic.unstable_mapSliceZone).toStrictEqual(prismic.mapSliceZone)
})
