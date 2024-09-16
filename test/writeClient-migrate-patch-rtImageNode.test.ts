import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import type { InjectMigrationSpecificTypes, RichTextField } from "../src"
import { RichTextNodeType } from "../src"

testMigrationFieldPatching<InjectMigrationSpecificTypes<RichTextField>>(
	"patches rich text image nodes",
	{
		new: ({ ctx, migration }) => [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			{
				type: RichTextNodeType.image,
				id: migration.createAsset("foo", "foo.png"),
			},
		],
		existing: ({ ctx, existingAssets }) => [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			{
				type: RichTextNodeType.image,
				id: existingAssets[0].id,
				url: existingAssets[0].url,
				dimensions: {
					width: existingAssets[0].width!,
					height: existingAssets[0].height!,
				},
				edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
				alt: existingAssets[0].alt || null,
				copyright: existingAssets[0].credits || null,
			},
		],
		newLinkTo: ({ ctx, migration, existingDocuments }) => [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			{
				type: RichTextNodeType.image,
				id: migration.createAsset("foo", "foo.png"),
				linkTo: existingDocuments[0],
			},
		],
	},
)

testMigrationFieldPatching<InjectMigrationSpecificTypes<RichTextField>>(
	"patches rich text image nodes (from Prismic)",
	{
		simple: ({ ctx, mockedDomain }) => [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			{
				type: RichTextNodeType.image,
				...ctx.mock.value.image({ state: "filled" }),
				id: "foo-id",
				url: `${mockedDomain}/foo.png`,
			},
		],
		withLinkTo: ({ ctx, mockedDomain, existingDocuments }) => [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			{
				type: RichTextNodeType.image,
				...ctx.mock.value.image({ state: "filled" }),
				id: "foo-id",
				url: `${mockedDomain}/foo.png`,
				linkTo: existingDocuments[0],
			},
		],
	},
	{ mode: "fromPrismic" },
)
