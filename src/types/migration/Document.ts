import type { FilledContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument, PrismicDocumentWithUID } from "../value/document"
import type { AnyOEmbed, EmbedField, OEmbedExtra } from "../value/embed"
import type { FilledImageFieldImage } from "../value/image"
import type { FilledLinkToMediaField } from "../value/linkToMedia"
import type { RTImageNode } from "../value/richText"
import type { SharedSlice } from "../value/sharedSlice"

import type {
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "./Asset"
import type { MigrationContentRelationship } from "./ContentRelationship"

/**
 * A utility type that extends any fields in a record with their migration
 * fields equivalent.
 *
 * @typeParam T - Type of the record to extend.
 */
export type InjectMigrationSpecificTypes<T> = T extends RTImageNode
	?
			| T
			| (Omit<T, "linkTo"> & InjectMigrationSpecificTypes<Pick<T, "linkTo">>)
			| MigrationRTImageNode
			| undefined
	: T extends FilledImageFieldImage
		? T | MigrationImage | undefined
		: T extends FilledLinkToMediaField
			? T | MigrationLinkToMedia | undefined
			: T extends FilledContentRelationshipField
				? T | MigrationContentRelationship
				: T extends EmbedField<AnyOEmbed & OEmbedExtra, "filled">
					? T | Pick<T, "embed_url">
					: T extends SharedSlice
						?
								| T
								| InjectMigrationSpecificTypes<
										Omit<T, "id" | "slice_label" | "version">
								  >
						: // eslint-disable-next-line @typescript-eslint/no-explicit-any
							T extends Record<any, any>
							? { [P in keyof T]: InjectMigrationSpecificTypes<T[P]> }
							: T extends Array<infer U>
								? Array<InjectMigrationSpecificTypes<U>>
								: T

/**
 * A utility type that ties the type and data of a Prismic document, creating a
 * strict union.
 */
type TiedDocumentTypeAndData<TDocument extends PrismicDocument> =
	TDocument extends PrismicDocument<infer TData, infer TType>
		? {
				/**
				 * Type of the document.
				 */
				type: TType

				/**
				 * Data contained in the document.
				 */
				data: InjectMigrationSpecificTypes<TData>
			} & (TDocument extends PrismicDocumentWithUID
				? Pick<TDocument, "uid">
				: Partial<Pick<TDocument, "uid">>)
		: never

/**
 * A pending Prismic document to be created with the Migration API.
 *
 * @typeParam TDocument - Type of the Prismic document.
 */
export type PendingPrismicDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> = Pick<TDocument, "lang"> &
	Partial<Pick<TDocument, "tags">> &
	TiedDocumentTypeAndData<TDocument>

/**
 * An existing Prismic document to be updated with the Migration API.
 *
 * @typeParam TDocument - Type of the Prismic document.
 */
export type ExistingPrismicDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> = Omit<TDocument, "uid" | "type" | "data"> &
	TiedDocumentTypeAndData<TDocument>

/**
 * A Prismic document to be sent to the Migration API.
 *
 * @typeParam TDocument - Type of the Prismic document.
 */
export type MigrationDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> = PendingPrismicDocument<TDocument> | ExistingPrismicDocument<TDocument>

/**
 * A Prismic migration document instance.
 *
 * @typeParam TDocument - Type of the Prismic document.
 */
export class PrismicMigrationDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> {
	/**
	 * The document to be sent to the Migration API.
	 */
	document: MigrationDocument<TDocument> & Partial<Pick<TDocument, "id">>

	/**
	 * The name of the document displayed in the editor.
	 */
	title?: string

	/**
	 * The link to the master language document to relate the document to if any.
	 */
	masterLanguageDocument?: MigrationContentRelationship

	/**
	 * Original Prismic document when the migration document came from another
	 * Prismic repository.
	 *
	 * @remarks
	 * When migrating a document from another repository, one might want to alter
	 * it with migration specific types, hence accepting an
	 * `ExistingPrismicDocument` instead of a regular `PrismicDocument`.
	 */
	originalPrismicDocument?: ExistingPrismicDocument<PrismicDocument>

	/**
	 * Creates a Prismic migration document instance.
	 *
	 * @param document - The document to be sent to the Migration API.
	 * @param title - The name of the document displayed in the editor.
	 * @param params - Parameters to create/update the document with on the
	 *   Migration API.
	 *
	 * @returns A Prismic migration document instance.
	 */
	constructor(
		document: MigrationDocument<TDocument>,
		title?: string,
		params?: {
			masterLanguageDocument?: MigrationContentRelationship
			originalPrismicDocument?: ExistingPrismicDocument<PrismicDocument>
		},
	) {
		this.document = document
		this.title = title
		this.masterLanguageDocument = params?.masterLanguageDocument
		this.originalPrismicDocument = params?.originalPrismicDocument
	}
}
