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
>("patches content relationship fields", {
	existing: ({ existingDocuments }) => existingDocuments[0],
	existingLongForm: ({ existingDocuments }) => {
		return {
			link_type: LinkType.Document,
			id: existingDocuments[0],
		}
	},
	existingLongFormWithText: ({ existingDocuments }) => {
		return {
			link_type: LinkType.Document,
			id: existingDocuments[0],
			text: "foo",
		}
	},
	otherCreate: ({ otherCreateDocument }) => otherCreateDocument,
	lazyExisting: ({ existingDocuments }) => {
		return () => existingDocuments[0]
	},
	lazyOtherCreate: ({ migration, otherCreateDocument }) => {
		return () =>
			migration.getByUID(
				otherCreateDocument.document.type,
				otherCreateDocument.document.uid!,
			)
	},
	lazyOtherCreateMissingID: ({ migration, otherCreateDocument }) => {
		return () => {
			const doc = migration.getByUID(
				otherCreateDocument.document.type,
				otherCreateDocument.document.uid!,
			)

			delete doc?.document.id

			return doc
		}
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
	"patches content relationship fields (from Prismic)",
	{
		simple: ({ ctx, otherFromPrismicDocument }) => {
			const contentRelationship = ctx.mock.value.link({
				type: LinkType.Document,
			})
			// `migrationDocuments` contains documents from "another repository"
			contentRelationship.id =
				otherFromPrismicDocument.originalPrismicDocument!.id

			return contentRelationship
		},
		withText: ({ ctx, otherFromPrismicDocument }) => {
			const contentRelationship = ctx.mock.value.link({
				type: LinkType.Document,
			})
			// `migrationDocuments` contains documents from "another repository"
			contentRelationship.id =
				otherFromPrismicDocument.originalPrismicDocument!.id

			// TODO: Remove when link text PR is merged
			// @ts-expect-error - Future-proofing for link text
			contentRelationship.text = "foo"

			return contentRelationship
		},
		broken: () => {
			return {
				link_type: LinkType.Document,
				id: "id",
				type: "type",
				tags: [],
				lang: "lang",
				isBroken: true,
			}
		},
	},
	{ mode: "fromPrismic" },
)
