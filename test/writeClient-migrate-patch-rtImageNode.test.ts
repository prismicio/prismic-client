import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"
import { assetToImage } from "../src/types/migration/Asset"
import { MigrationContentRelationship } from "../src/types/migration/ContentRelationship"

testMigrationFieldPatching("patches rich text image nodes", {
	new: ({ ctx, migration }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		migration.createAsset("foo", "foo.png").asRTImageNode(),
	],
	existing: ({ ctx, existingAssets }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		{
			type: RichTextNodeType.image,
			...assetToImage(existingAssets[0]),
		},
	],
	newLinkTo: ({ ctx, migration, existingDocuments }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		migration
			.createAsset("foo", "foo.png")
			.asRTImageNode(new MigrationContentRelationship(existingDocuments[0])),
	],
})

testMigrationFieldPatching(
	"patches rich text image nodes",
	{
		otherRepository: ({ ctx, mockedDomain }) => [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			{
				type: RichTextNodeType.image,
				...ctx.mock.value.image({ state: "filled" }),
				id: "foo-id",
				url: `${mockedDomain}/foo.png`,
			},
		],
		otherRepositoryLinkTo: ({
			ctx,
			migration,
			mockedDomain,
			existingDocuments,
		}) => [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			{
				type: RichTextNodeType.image,
				...ctx.mock.value.image({ state: "filled" }),
				id: "foo-id",
				url: `${mockedDomain}/foo.png`,
				linkTo: migration.createContentRelationship(existingDocuments[0]),
			},
		],
	},
	{ mode: "fromPrismic" },
)
