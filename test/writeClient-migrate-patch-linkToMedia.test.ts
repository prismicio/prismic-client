import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"
import { AssetType } from "../src/types/api/asset/asset"
import { assetToLinkToMedia } from "../src/types/migration/Asset"

testMigrationFieldPatching("patches link to media fields", {
	new: ({ migration }) =>
		migration.createAsset("foo", "foo.png").asLinkToMedia(),
	existing: ({ existingAssets }) => assetToLinkToMedia(existingAssets[0]),
	existingNonImage: ({ existingAssets }) => {
		existingAssets[0].filename = "foo.pdf"
		existingAssets[0].extension = "pdf"
		existingAssets[0].kind = AssetType.Document
		existingAssets[0].width = undefined
		existingAssets[0].height = undefined

		return assetToLinkToMedia(existingAssets[0])
	},
	richTextNew: ({ migration }) => [
		{
			type: RichTextNodeType.paragraph,
			text: "lorem",
			spans: [
				{ type: RichTextNodeType.strong, start: 0, end: 5 },
				{
					type: RichTextNodeType.hyperlink,
					start: 0,
					end: 5,
					data: migration.createAsset("foo", "foo.png").asLinkToMedia(),
				},
			],
		},
	],
	richTextExisting: ({ existingAssets }) => [
		{
			type: RichTextNodeType.paragraph,
			text: "lorem",
			spans: [
				{ type: RichTextNodeType.strong, start: 0, end: 5 },
				{
					type: RichTextNodeType.hyperlink,
					start: 0,
					end: 5,
					data: assetToLinkToMedia(existingAssets[0]),
				},
			],
		},
	],
})

testMigrationFieldPatching(
	"patches link to media fields",
	{
		otherRepository: ({ ctx, mockedDomain }) => {
			return {
				...ctx.mock.value.linkToMedia({ state: "filled" }),
				id: "foo-id",
				url: `${mockedDomain}/foo.png`,
			}
		},
		richTextOtherRepository: ({ ctx, mockedDomain }) => [
			{
				type: RichTextNodeType.paragraph,
				text: "lorem",
				spans: [
					{ type: RichTextNodeType.strong, start: 0, end: 5 },
					{
						type: RichTextNodeType.hyperlink,
						start: 0,
						end: 5,
						data: {
							...ctx.mock.value.linkToMedia({ state: "filled" }),
							id: "foo-id",
							url: `${mockedDomain}/foo.png`,
						},
					},
				],
			},
		],
	},
	{ mode: "fromPrismic" },
)
