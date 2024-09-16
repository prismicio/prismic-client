import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import type {
	InjectMigrationSpecificTypes,
	LinkToMediaField,
	RichTextField,
} from "../src"
import { LinkType, RichTextNodeType } from "../src"
import type { Asset } from "../src/types/api/asset/asset"
import { AssetType } from "../src/types/api/asset/asset"
import type { MigrationLinkToMedia } from "../src/types/migration/Asset"

const assetToLinkToMedia = (
	asset: Asset,
	text?: string,
): LinkToMediaField<"filled"> => {
	return {
		id: asset.id,
		link_type: LinkType.Media,
		name: asset.filename,
		kind: asset.kind,
		url: asset.url,
		size: `${asset.size}`,
		height: typeof asset.height === "number" ? `${asset.height}` : undefined,
		width: typeof asset.width === "number" ? `${asset.width}` : undefined,
		// TODO: Remove when link text PR is merged
		// @ts-expect-error - Future-proofing for link text
		text,
	}
}

testMigrationFieldPatching<
	| MigrationLinkToMedia
	| LinkToMediaField
	| InjectMigrationSpecificTypes<RichTextField>
>("patches link to media fields", {
	new: ({ migration }) => {
		return {
			link_type: LinkType.Media,
			id: migration.createAsset("foo", "foo.png"),
		}
	},
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
					data: {
						link_type: LinkType.Media,
						id: migration.createAsset("foo", "foo.png"),
					},
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

testMigrationFieldPatching<LinkToMediaField | RichTextField>(
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
