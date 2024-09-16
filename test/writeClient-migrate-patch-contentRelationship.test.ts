import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import type {
	ContentRelationshipField,
	InjectMigrationSpecificTypes,
	MigrationContentRelationship,
	RichTextField,
} from "../src"
import { LinkType, RichTextNodeType } from "../src"

testMigrationFieldPatching<
	MigrationContentRelationship | InjectMigrationSpecificTypes<RichTextField>
>("patches link fields", {
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

testMigrationFieldPatching<ContentRelationshipField>(
	"patches link fields",
	{
		brokenLink: () => {
			return {
				link_type: LinkType.Document,
				id: "id",
				type: "type",
				tags: [],
				lang: "lang",
				isBroken: true,
			}
		},
		otherRepositoryContentRelationship: ({ ctx, migrationDocuments }) => {
			const contentRelationship = ctx.mock.value.link({
				type: LinkType.Document,
			})
			// `migrationDocuments` contains documents from "another repository"
			contentRelationship.id =
				migrationDocuments.otherRepository.originalPrismicDocument!.id

			return contentRelationship
		},
	},
	{ mode: "fromPrismic" },
)
