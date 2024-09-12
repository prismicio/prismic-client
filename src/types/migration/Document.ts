import type { AnyRegularField } from "../value/types"

import type { FilledContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument } from "../value/document"
import type { GroupField } from "../value/group"
import type { FilledImageFieldImage } from "../value/image"
import type { FilledLinkToMediaField } from "../value/linkToMedia"
import type {
	RTBlockNode,
	RTImageNode,
	RTInlineNode,
	RTLinkNode,
	RTTextNode,
	RichTextField,
} from "../value/richText"
import type { SharedSlice } from "../value/sharedSlice"
import type { Slice } from "../value/slice"
import type { SliceZone } from "../value/sliceZone"

import type {
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "./Asset"
import type { MigrationContentRelationship } from "./ContentRelationship"
import type { MigrationField, ResolveArgs } from "./Field"

/**
 * A utility type that extends Rich text field node's spans with their migration
 * node equivalent.
 *
 * @typeParam TRTNode - Rich text text node type to convert.
 */
type RichTextTextNodeWithMigrationField<
	TRTNode extends RTTextNode = RTTextNode,
> = Omit<TRTNode, "spans"> & {
	spans: (
		| RTInlineNode
		| (Omit<RTLinkNode, "data"> & {
				data: MigrationLinkToMedia | MigrationContentRelationship
		  })
	)[]
}

/**
 * A utility type that extends a Rich text field node with their migration node
 * equivalent.
 *
 * @typeParam TRTNode - Rich text block node type to convert.
 */
export type RichTextBlockNodeWithMigrationField<
	TRTNode extends RTBlockNode = RTBlockNode,
> = TRTNode extends RTImageNode
	? RTImageNode | MigrationRTImageNode
	: TRTNode extends RTTextNode
		? RichTextTextNodeWithMigrationField<TRTNode>
		: TRTNode

/**
 * A utility type that extends a Rich text field's nodes with their migration
 * node equivalent.
 *
 * @typeParam TField - Rich text field type to convert.
 */
export type RichTextFieldWithMigrationField<
	TField extends RichTextField = RichTextField,
> = {
	[Index in keyof TField]: RichTextBlockNodeWithMigrationField<TField[Index]>
}

/**
 * A utility type that extends a regular field with their migration field
 * equivalent.
 *
 * @typeParam TField - Regular field type to convert.
 */
type RegularFieldWithMigrationField<
	TField extends AnyRegularField = AnyRegularField,
> =
	| (TField extends FilledImageFieldImage
			? MigrationImage | undefined
			: TField extends FilledLinkToMediaField
				? MigrationLinkToMedia | undefined
				: TField extends FilledContentRelationshipField
					? MigrationContentRelationship | undefined
					: TField extends RichTextField
						? RichTextFieldWithMigrationField<TField>
						: never)
	| TField

/**
 * A utility type that extends a group's fields with their migration fields
 * equivalent.
 *
 * @typeParam TField - Group field type to convert.
 */
type GroupFieldWithMigrationField<
	TField extends GroupField | Slice["items"] | SharedSlice["items"] =
		| GroupField
		| Slice["items"]
		| SharedSlice["items"],
> = FieldsWithMigrationFields<TField[number]>[]

type SliceWithMigrationField<
	TField extends Slice | SharedSlice = Slice | SharedSlice,
> = Omit<TField, "primary" | "items"> & {
	primary: FieldsWithMigrationFields<TField["primary"]>
	items: GroupFieldWithMigrationField<TField["items"]>
}

/**
 * A utility type that extends a SliceZone's slices fields with their migration
 * fields equivalent.
 *
 * @typeParam TField - Field type to convert.
 */
type SliceZoneWithMigrationField<TField extends SliceZone = SliceZone> =
	SliceWithMigrationField<TField[number]>[]

/**
 * A utility type that extends any field with their migration field equivalent.
 *
 * @typeParam TField - Field type to convert.
 */
export type FieldWithMigrationField<
	TField extends AnyRegularField | GroupField | SliceZone =
		| AnyRegularField
		| GroupField
		| SliceZone,
> = TField extends AnyRegularField
	? RegularFieldWithMigrationField<TField>
	: TField extends GroupField
		? GroupFieldWithMigrationField<TField>
		: TField extends SliceZone
			? SliceZoneWithMigrationField<TField>
			: never

/**
 * A utility type that extends a record of fields with their migration fields
 * equivalent.
 *
 * @typeParam TFields - Type of the record of Prismic fields.
 */
export type FieldsWithMigrationFields<
	TFields extends Record<
		string,
		AnyRegularField | GroupField | SliceZone
	> = Record<string, AnyRegularField | GroupField | SliceZone>,
> = {
	[Key in keyof TFields]: FieldWithMigrationField<TFields[Key]>
}

/**
 * Makes the UID of {@link MigrationDocumentValue} optional on custom types
 * without UID. TypeScript fails to infer correct types if done with a type
 * intersection.
 *
 * @internal
 */
type MakeUIDOptional<TMigrationDocument extends { uid: string | null }> =
	TMigrationDocument["uid"] extends string
		? TMigrationDocument
		: Omit<TMigrationDocument, "uid"> & Partial<Pick<TMigrationDocument, "uid">>

/**
 * A Prismic document value compatible with the Migration API.
 *
 * @see More details on the Migration API: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export type MigrationDocumentValue<
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
				data: FieldsWithMigrationFields<TData>
			}>
		: never

/**
 * Parameters used when creating a Prismic document with the Migration API.
 *
 * @see More details on the Migration API: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export type MigrationDocumentParams = {
	/**
	 * Name of the document displayed in the editor.
	 */
	documentTitle: string

	/**
	 * A link to the master language document.
	 */
	// We're forced to inline `ContentRelationshipMigrationField` here, otherwise
	// it creates a circular reference to itself which makes TypeScript unhappy.
	// (but I think it's weird and it doesn't make sense :thinking:)
	masterLanguageDocument?: MigrationContentRelationship
}

/**
 * A Prismic migration document instance.
 *
 * @see More details on the Migration API: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export class MigrationDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> {
	/**
	 * The document value to be sent to the Migration API.
	 */
	value: MigrationDocumentValue<TDocument>

	/**
	 * Parameters to create/update the document with on the Migration API.
	 */
	params: MigrationDocumentParams

	/**
	 * Asset and content relationship fields that this document depends on.
	 */
	#dependencies: MigrationField[]

	/**
	 * The mode to use when creating or updating the document.
	 *
	 * - `auto`: Automatically determines if the document should be created or
	 *   updated on the document's existence on the repository's Document API.
	 * - `update`: Forces the document to only be updated. This is useful when the
	 *   document only exists within the migration release which cannot be
	 *   queried.
	 *
	 * @internal
	 */
	_mode: "auto" | "update" = "auto"

	/**
	 * Creates a Prismic migration document instance.
	 *
	 * @param value - The document value to be sent to the Migration API.
	 * @param params - Parameters to create/update the document with on the
	 *   Migration API.
	 * @param dependencies - Asset and content relationship fields that this
	 *   document depends on.
	 *
	 * @returns A Prismic migration document instance.
	 */
	constructor(
		value: MigrationDocumentValue<TDocument>,
		params: MigrationDocumentParams,
		dependencies: MigrationField[] = [],
	) {
		this.value = value
		this.params = params
		this.#dependencies = dependencies
	}

	/**
	 * Resolves each dependencies of the document with the provided maps.
	 *
	 * @param args - A map of documents and a map of assets to resolve content
	 *   with.
	 *
	 * @internal
	 */
	async _resolve(args: ResolveArgs): Promise<void> {
		for (const dependency of this.#dependencies) {
			await dependency._resolve(args)
		}
	}
}

/**
 * A map of document IDs, documents, and migration documents to content
 * relationship field used to resolve content relationships when patching
 * migration Prismic documents.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @internal
 */
export type DocumentMap<TDocuments extends PrismicDocument = PrismicDocument> =
	Map<
		string | MigrationDocument | MigrationDocument<TDocuments>,
		| PrismicDocument
		| (Omit<MigrationDocumentValue<PrismicDocument>, "id"> & { id: string })
	>
