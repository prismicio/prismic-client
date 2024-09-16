import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"

testMigrationFieldPatching("patches link fields", {
	existing: ({ existingDocuments }) => existingDocuments[0],
	migration: ({ migrationDocuments }) => {
		delete migrationDocuments.other.document.id

		return migrationDocuments.other
	},
	lazyExisting: ({ existingDocuments }) => {
		return () => existingDocuments[0]
	},
	lazyMigration: ({ migration, migrationDocuments }) => {
		delete migrationDocuments.other.document.id

		return () =>
			migration.getByUID(
				migrationDocuments.other.document.type,
				migrationDocuments.other.document.uid!,
			)
	},
	migrationNoTags: ({ migration, migrationDocuments }) => {
		migrationDocuments.other.document.tags = undefined

		return () =>
			migration.getByUID(
				migrationDocuments.other.document.type,
				migrationDocuments.other.document.uid!,
			)
	},
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

testMigrationFieldPatching(
	"patches link fields",
	{
		brokenLink: () => {
			return {
				link_type: "Document",
				id: "id",
				type: "type",
				tags: [],
				lang: "lang",
				isBroken: true,
			}
		},
		otherRepositoryContentRelationship: ({ ctx, migrationDocuments }) => {
			const contentRelationship = ctx.mock.value.link({ type: "Document" })
			// `migrationDocuments` contains documents from "another repository"
			contentRelationship.id =
				migrationDocuments.otherRepository.originalPrismicDocument!.id

			return contentRelationship
		},
	},
	{ mode: "fromPrismic" },
)
