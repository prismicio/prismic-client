import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"

testMigrationFieldPatching("patches link fields", {
	existing: ({ existingDocuments }) => existingDocuments[0],
	migration: ({ migrationDocuments }) => {
		delete migrationDocuments[0].document.id

		return migrationDocuments[0]
	},
	lazyExisting: ({ existingDocuments }) => {
		return () => existingDocuments[0]
	},
	lazyMigration: ({ migration, migrationDocuments }) => {
		delete migrationDocuments[0].document.id

		return () =>
			migration.getByUID(
				migrationDocuments[0].document.type,
				migrationDocuments[0].document.uid!,
			)
	},
	migrationNoTags: ({ migration, migrationDocuments }) => {
		migrationDocuments[0].document.tags = undefined

		return () =>
			migration.getByUID(
				migrationDocuments[0].document.type,
				migrationDocuments[0].document.uid!,
			)
	},
	otherRepositoryContentRelationship: ({ ctx, migrationDocuments }) => {
		const contentRelationship = ctx.mock.value.link({ type: "Document" })
		// `migrationDocuments` contains documents from "another repository"
		contentRelationship.id = migrationDocuments[0].document.id!

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
})
