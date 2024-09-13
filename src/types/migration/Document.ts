import type { FilledContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument, PrismicDocumentWithUID } from "../value/document"
import type { FilledImageFieldImage } from "../value/image"
import type { FilledLinkToMediaField } from "../value/linkToMedia"
import type { RTImageNode } from "../value/richText"

import type {
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "./Asset"
import type { MigrationContentRelationship } from "./ContentRelationship"
import type { MigrationField, ResolveArgs } from "./Field"

/**
 * A utility type that extends any fields in a record with their migration
 * fields equivalent.
 *
 * @typeParam T - Type of the record to extend.
 */
export type InjectMigrationSpecificTypes<T> = T extends RTImageNode
	? T | MigrationRTImageNode | undefined
	: T extends FilledImageFieldImage
		? T | MigrationImage | undefined
		: T extends FilledLinkToMediaField
			? T | MigrationLinkToMedia | undefined
			: T extends FilledContentRelationshipField
				? T | MigrationContentRelationship | undefined
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
	title: string

	// We're forced to inline `ContentRelationshipMigrationField` here, otherwise
	// it creates a circular reference to itself which makes TypeScript unhappy.
	// (but I think it's weird and it doesn't make sense :thinking:)
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
	 * Asset and content relationship fields that this document depends on.
	 */
	#dependencies: MigrationField[]

	/**
	 * Creates a Prismic migration document instance.
	 *
	 * @param document - The document to be sent to the Migration API.
	 * @param title - The name of the document displayed in the editor.
	 * @param options - Parameters to create/update the document with on the
	 *   Migration API.
	 * @param dependencies - Asset and content relationship fields that this
	 *   document depends on.
	 *
	 * @returns A Prismic migration document instance.
	 */
	constructor(
		document: MigrationDocument<TDocument>,
		title: string,
		options: {
			masterLanguageDocument?: MigrationContentRelationship
			originalPrismicDocument?: ExistingPrismicDocument<PrismicDocument>
			dependencies: MigrationField[]
		},
	) {
		this.document = document
		this.title = title
		this.masterLanguageDocument = options.masterLanguageDocument
		this.originalPrismicDocument = options.originalPrismicDocument
		this.#dependencies = options.dependencies
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
		string | PrismicMigrationDocument<TDocuments>,
		PrismicDocument | (MigrationDocument<TDocuments> & Pick<TDocuments, "id">)
	>
