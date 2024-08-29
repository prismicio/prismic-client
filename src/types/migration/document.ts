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

import type { ImageMigrationField, LinkMigrationField } from "./fields"
import type { RTImageMigrationNode, RTLinkMigrationNode } from "./richText"

/**
 * A utility type that converts a rich text text node to a rich text text
 * migration node.
 *
 * @typeParam TRTNode - Rich text text node type to convert.
 */
type RichTextTextNodeToMigrationField<TRTNode extends RTTextNode> = Omit<
	TRTNode,
	"spans"
> & {
	spans: (RTInlineNode | RTLinkMigrationNode)[]
}

/**
 * A utility type that converts a rich text block node to a rich text block
 * migration node.
 *
 * @typeParam TRTNode - Rich text block node type to convert.
 */
type RichTextBlockNodeToMigrationField<TRTNode extends RTBlockNode> =
	TRTNode extends RTImageNode
		?
				| RTImageMigrationNode
				| (Omit<RTImageNode, "linkTo"> & {
						linkTo?: RTImageNode["linkTo"] | LinkMigrationField
				  })
		: TRTNode extends RTTextNode
			? RichTextTextNodeToMigrationField<TRTNode>
			: TRTNode

/**
 * A utility type that converts a rich text field to a rich text migration
 * field.
 *
 * @typeParam TField - Rich text field type to convert.
 */
export type RichTextFieldToMigrationField<TField extends RichTextField> = {
	[Index in keyof TField]: RichTextBlockNodeToMigrationField<TField[Index]>
}

/**
 * A utility type that converts a regular field to a regular migration field.
 *
 * @typeParam TField - Regular field type to convert.
 */
type RegularFieldToMigrationField<TField extends AnyRegularField> =
	| (TField extends ImageField
			? ImageMigrationField
			: TField extends LinkField
				? LinkMigrationField
				: TField extends RichTextField
					? RichTextFieldToMigrationField<TField>
					: never)
	| TField

/**
 * A utility type that converts a group field to a group migration field.
 *
 * @typeParam TField - Group field type to convert.
 */
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

/**
 * A utility type that converts a field to a migration field.
 *
 * @typeParam TField - Field type to convert.
 */
export type SliceZoneToMigrationField<TField extends SliceZone> =
	SliceToMigrationField<TField[number]>[]

/**
 * A utility type that converts a field to a migration field.
 *
 * @typeParam TField - Field type to convert.
 */
export type FieldToMigrationField<
	TField extends AnyRegularField | GroupField | SliceZone,
> = TField extends AnyRegularField
	? RegularFieldToMigrationField<TField>
	: TField extends GroupField
		? GroupFieldToMigrationField<TField>
		: TField extends SliceZone
			? SliceZoneToMigrationField<TField>
			: never

/**
 * A utility type that converts a record of fields to a record of migration
 * fields.
 *
 * @typeParam TFields - Type of the record of Prismic fields.
 */
export type FieldsToMigrationFields<
	TFields extends Record<string, AnyRegularField | GroupField | SliceZone>,
> = {
	[Key in keyof TFields]: FieldToMigrationField<TFields[Key]>
}

/**
 * Makes the UID of `PrismicMigrationDocument` optional on custom types without
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
export type PrismicMigrationDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> =
	TDocument extends PrismicDocument<infer TData, infer TType, infer TLang>
		? MakeUIDOptional<{
				/**
				 * Type of the document.
				 */
				type: TType

				/**
				 * The unique identifier for the document. Guaranteed to be unique among
				 * all Prismic documents of the same type.
				 */
				uid: TDocument["uid"]

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
				id?: TDocument["id"]

				/**
				 * Alternate language documents from Prismic content API. Used as a
				 * substitute to the `masterLanguageDocument` options when the latter is
				 * not available.
				 *
				 * @internal
				 */
				// Made optional compared to the original type.
				alternate_languages?: TDocument["alternate_languages"]

				/**
				 * Tags associated with document.
				 */
				// Made optional compared to the original type.
				tags?: TDocument["tags"]

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
export type PrismicMigrationDocumentParams = {
	/**
	 * Name of the document displayed in the editor.
	 */
	documentName: string

	/**
	 * A link to the master language document.
	 */
	// We're forced to inline `ContentRelationshipMigrationField` here, otherwise
	// it creates a circular reference to itself which makes TypeScript unhappy.
	// (but I think it's weird and it doesn't make sense :thinking:)
	masterLanguageDocument?:
		| PrismicDocument
		| PrismicMigrationDocument
		| (() =>
				| Promise<PrismicDocument | PrismicMigrationDocument | undefined>
				| PrismicDocument
				| PrismicMigrationDocument
				| undefined)
}
