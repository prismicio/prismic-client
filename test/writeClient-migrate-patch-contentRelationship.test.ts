import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"

testMigrationFieldPatching("patches link fields", {
	existing: ({ migration, existingDocuments }) =>
		migration.createContentRelationship(existingDocuments[0]),
	migration: ({ migration, migrationDocuments }) => {
		delete migrationDocuments.other.document.id

		return migration.createContentRelationship(migrationDocuments.other)
	},
	lazyExisting: ({ migration, existingDocuments }) => {
		return migration.createContentRelationship(() => existingDocuments[0])
	},
	lazyMigration: ({ migration, migrationDocuments }) => {
		delete migrationDocuments.other.document.id

		return migration.createContentRelationship(() =>
			migration.getByUID(
				migrationDocuments.other.document.type,
				migrationDocuments.other.document.uid!,
			),
		)
	},
	migrationNoTags: ({ migration, migrationDocuments }) => {
		migrationDocuments.other.document.tags = undefined

		return migration.createContentRelationship(() =>
			migration.getByUID(
				migrationDocuments.other.document.type,
				migrationDocuments.other.document.uid!,
			),
		)
	},
	otherRepositoryContentRelationship: ({ ctx, migrationDocuments }) => {
		const contentRelationship = ctx.mock.value.link({ type: "Document" })
		// `migrationDocuments` contains documents from "another repository"
		contentRelationship.id =
			migrationDocuments.otherRepository.originalPrismicDocument!.id

		return contentRelationship
	},
	brokenLink: () => {
		return { type: "Document", isBroken: true }
	},
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
