import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"

testMigrationFieldPatching("patches link fields", {
	existing: ({ migration, existingDocuments }) =>
		migration.createContentRelationship(existingDocuments[0]),
	migration: ({ migration, migrationDocuments }) => {
		delete migrationDocuments[0].value.id

		return migration.createContentRelationship(migrationDocuments[0])
	},
	lazyExisting: ({ migration, existingDocuments }) => {
		return migration.createContentRelationship(() => existingDocuments[0])
	},
	lazyMigration: ({ migration, migrationDocuments }) => {
		delete migrationDocuments[0].value.id

		return migration.createContentRelationship(() =>
			migration.getByUID(
				migrationDocuments[0].value.type,
				migrationDocuments[0].value.uid!,
			),
		)
	},
	migrationNoTags: ({ migration, migrationDocuments }) => {
		migrationDocuments[0].value.tags = undefined

		return migration.createContentRelationship(() =>
			migration.getByUID(
				migrationDocuments[0].value.type,
				migrationDocuments[0].value.uid!,
			),
		)
	},
	otherRepositoryContentRelationship: ({ ctx, migrationDocuments }) => {
		const contentRelationship = ctx.mock.value.link({ type: "Document" })
		// `migrationDocuments` contains documents from "another repository"
		contentRelationship.id = migrationDocuments[0].value.id!

		return contentRelationship
	},
	brokenLink: ({ ctx }) => ctx.mock.value.link({ type: "Document" }),
	richTextLinkNode: ({ migration, existingDocuments }) => [
		{
			type: RichTextNodeType.paragraph,
			text: "lorem",
			spans: [
				{ type: RichTextNodeType.strong, start: 0, end: 5 },
				{
					type: RichTextNodeType.hyperlink,
					start: 0,
					end: 5,
					data: migration.createContentRelationship(existingDocuments[0]),
				},
			],
		},
	],
})
