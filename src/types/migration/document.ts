import type { AnyRegularField } from "../value/types"

import type { PrismicDocument } from "../value/document"
import type { GroupField } from "../value/group"
import type { ImageField } from "../value/image"
import type { LinkField } from "../value/link"
import type {
	RTBlockNode,
	RTImageNode,
	RTInlineNode,
	RTTextNode,
	RichTextField,
} from "../value/richText"
import type { SharedSlice } from "../value/sharedSlice"
import type { Slice } from "../value/slice"
import type { SliceZone } from "../value/sliceZone"

import type { MigrationImageField, MigrationLinkField } from "./fields"
import type { MigrationRTImageNode, MigrationRTLinkNode } from "./richText"

type RichTextTextNodeToMigrationField<TRTNode extends RTTextNode> = Omit<
	TRTNode,
	"spans"
> & {
	spans: (RTInlineNode | MigrationRTLinkNode)[]
}

type RichTextBlockNodeToMigrationField<TRTNode extends RTBlockNode> =
	TRTNode extends RTImageNode
		?
				| MigrationRTImageNode
				| (Omit<RTImageNode, "linkTo"> & {
						linkTo?: RTImageNode["linkTo"] | MigrationLinkField
				  })
		: TRTNode extends RTTextNode
			? RichTextTextNodeToMigrationField<TRTNode>
			: TRTNode

export type RichTextFieldToMigrationField<TField extends RichTextField> = {
	[Index in keyof TField]: RichTextBlockNodeToMigrationField<TField[Index]>
}

type RegularFieldToMigrationField<TField extends AnyRegularField> =
	| (TField extends ImageField
			? MigrationImageField
			: TField extends LinkField
				? MigrationLinkField
				: TField extends RichTextField
					? RichTextFieldToMigrationField<TField>
					: never)
	| TField

export type GroupFieldToMigrationField<
	TField extends GroupField | Slice["items"] | SharedSlice["items"],
> = FieldsToMigrationFields<TField[number]>[]

type SliceToMigrationField<TField extends Slice | SharedSlice> = Omit<
	TField,
	"primary" | "items"
> & {
	primary: FieldsToMigrationFields<TField["primary"]>
	items: GroupFieldToMigrationField<TField["items"]>
}

export type SliceZoneToMigrationField<TField extends SliceZone> =
	SliceToMigrationField<TField[number]>[]

export type FieldToMigrationField<
	TField extends AnyRegularField | GroupField | SliceZone,
> = TField extends AnyRegularField
	? RegularFieldToMigrationField<TField>
	: TField extends GroupField
		? GroupFieldToMigrationField<TField>
		: TField extends SliceZone
			? SliceZoneToMigrationField<TField>
			: never

export type FieldsToMigrationFields<
	TFields extends Record<string, AnyRegularField | GroupField | SliceZone>,
> = {
	[Key in keyof TFields]: FieldToMigrationField<TFields[Key]>
}

/**
 * Makes the UID of `MigrationPrismicDocument` optional on custom types without
 * UID. TypeScript fails to infer correct types if done with a type
 * intersection.
 *
 * @internal
 */
type MakeUIDOptional<TMigrationDocument extends { uid: string | null }> =
	TMigrationDocument["uid"] extends string
		? TMigrationDocument
		: Omit<TMigrationDocument, "uid"> & Partial<Pick<TMigrationDocument, "uid">>

/**
 * A Prismic document compatible with the migration API.
 *
 * @see More details on the migraiton API: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export type MigrationPrismicDocument<
	TDocuments extends PrismicDocument = PrismicDocument,
> =
	TDocuments extends PrismicDocument<infer TData, infer TType, infer TLang>
		? MakeUIDOptional<{
				/**
				 * Type of the document.
				 */
				type: TType

				/**
				 * The unique identifier for the document. Guaranteed to be unique among
				 * all Prismic documents of the same type.
				 */
				uid: TDocuments["uid"]

				/**
				 * Language of document.
				 */
				lang: TLang

				/**
				 * The identifier for the document. Used for compatibily with the
				 * content API.
				 *
				 * @internal
				 */
				// Made optional compared to the original type.
				id?: TDocuments["id"]

				/**
				 * Alternate language documents from Prismic content API. Used as a
				 * substitute to the `masterLanguageDocument` options when the latter is
				 * not available.
				 *
				 * @internal
				 */
				// Made optional compared to the original type.
				alternate_languages?: TDocuments["alternate_languages"]

				/**
				 * Tags associated with document.
				 */
				// Made optional compared to the original type.
				tags?: TDocuments["tags"]

				/**
				 * Data contained in the document.
				 */
				data: FieldsToMigrationFields<TData>
			}>
		: never

/**
 * Parameters used when creating a Prismic document with the migration API.
 *
 * @see More details on the migraiton API: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export type MigrationPrismicDocumentParams = {
	/**
	 * Name of the document displayed in the editor.
	 */
	documentName: string

	/**
	 * A link to the master language document.
	 */
	// We're forced to inline `MigrationContentRelationshipField` here, otherwise
	// it creates a circular reference to itself which makes TypeScript unhappy.
	// (but I think it's weird and it doesn't make sense :thinking:)
	masterLanguageDocument?:
		| PrismicDocument
		| MigrationPrismicDocument
		| (() =>
				| Promise<PrismicDocument | MigrationPrismicDocument | undefined>
				| PrismicDocument
				| MigrationPrismicDocument
				| undefined)
}
