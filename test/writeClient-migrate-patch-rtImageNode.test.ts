import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"
import { MigrationContentRelationship } from "../src/types/migration/ContentRelationship"

testMigrationFieldPatching("patches rich text image nodes", {
	new: ({ ctx, migration }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		migration.createAsset("foo", "foo.png").asRTImageNode(),
	],
	existing: ({ ctx, migration, existingAssets }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		migration.createAsset(existingAssets[0]).asRTImageNode(),
	],
	otherRepository: ({ ctx, mockedDomain }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		{
			type: RichTextNodeType.image,
			...ctx.mock.value.image({ state: "filled" }),
			id: "foo-id",
			url: `${mockedDomain}/foo.png`,
		},
	],
	newLinkTo: ({ ctx, migration, existingDocuments }) => {
		const rtImageNode = migration.createAsset("foo", "foo.png").asRTImageNode()
		rtImageNode.linkTo = new MigrationContentRelationship(existingDocuments[0])

		return [
			...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
			rtImageNode,
		]
	},
	otherRepositoryLinkTo: ({ ctx, mockedDomain, existingDocuments }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		{
			type: RichTextNodeType.image,
			...ctx.mock.value.image({ state: "filled" }),
			id: "foo-id",
			url: `${mockedDomain}/foo.png`,
			linkTo: existingDocuments[0],
		},
	],
})
