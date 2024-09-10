import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"

testMigrationFieldPatching("patches link fields", {
	existing: ({ existingDocuments }) => existingDocuments[0],
	migration: ({ migrationDocuments }) => {
		delete migrationDocuments[0].id

		return migrationDocuments[0]
	},
	lazyExisting: ({ existingDocuments }) => {
		return () => existingDocuments[0]
	},
	lazyMigration: ({ migration, migrationDocuments }) => {
		delete migrationDocuments[0].id

		return () =>
			migration.getByUID(migrationDocuments[0].type, migrationDocuments[0].uid)
	},
	migrationNoTags: ({ migration, migrationDocuments }) => {
		migrationDocuments[0].tags = undefined

		return () =>
			migration.getByUID(migrationDocuments[0].type, migrationDocuments[0].uid)
	},
	otherRepositoryContentRelationship: ({ ctx, migrationDocuments }) => {
		const contentRelationship = ctx.mock.value.link({ type: "Document" })
		// `migrationDocuments` contains documents from "another repository"
		contentRelationship.id = migrationDocuments[0].id!

		return contentRelationship
	},
	brokenLink: ({ ctx }) => ctx.mock.value.link({ type: "Document" }),
	richTextLinkNode: ({ existingDocuments }) => [
		{
			type: RichTextNodeType.paragraph,
			text: "lorem",
			spans: [
				{ type: RichTextNodeType.strong, start: 0, end: 5 },
				{
					type: RichTextNodeType.hyperlink,
					start: 0,
					end: 5,
					data: existingDocuments[0],
				},
			],
		},
	],
	richTextNewImageNodeLink: ({ ctx, migration, existingDocuments }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		{
			...migration.createAsset("foo", "foo.png"),
			linkTo: existingDocuments[0],
		},
	],
	richTextOtherReposiotryImageNodeLink: ({
		ctx,
		mockedDomain,
		existingDocuments,
	}) => [
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
