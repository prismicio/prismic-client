import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"
import { AssetType } from "../src/types/api/asset/asset"

testMigrationFieldPatching("patches link to media fields", {
	new: ({ migration }) => migration.createAsset("foo", "foo.png").linkToMedia,
	existing: ({ migration, existingAssets }) =>
		migration.createAsset(existingAssets[0]).linkToMedia,
	existingNonImage: ({ migration, existingAssets }) => {
		existingAssets[0].filename = "foo.pdf"
		existingAssets[0].extension = "pdf"
		existingAssets[0].kind = AssetType.Document
		existingAssets[0].width = undefined
		existingAssets[0].height = undefined

		return migration.createAsset(existingAssets[0]).linkToMedia
	},
	otherRepository: ({ ctx, mockedDomain }) => {
		return {
			...ctx.mock.value.linkToMedia({ state: "filled" }),
			id: "foo-id",
			url: `${mockedDomain}/foo.png`,
		}
	},
	otherRepositoryNotFoundID: ({ ctx }) => {
		return {
			...ctx.mock.value.linkToMedia({ state: "empty" }),
			id: null,
		}
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
					data: migration.createAsset("foo", "foo.png").linkToMedia,
				},
			],
		},
	],
	richTextExisting: ({ migration, existingAssets }) => [
		{
			type: RichTextNodeType.paragraph,
			text: "lorem",
			spans: [
				{ type: RichTextNodeType.strong, start: 0, end: 5 },
				{
					type: RichTextNodeType.hyperlink,
					start: 0,
					end: 5,
					data: migration.createAsset(existingAssets[0]).linkToMedia,
				},
			],
		},
	],
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
})
