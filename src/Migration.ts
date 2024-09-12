import { prepareMigrationRecord } from "./lib/prepareMigrationRecord"
import { validateAssetMetadata } from "./lib/validateAssetMetadata"

import type { Asset } from "./types/api/asset/asset"
import type { MigrationAssetConfig } from "./types/migration/Asset"
import { MigrationImage } from "./types/migration/Asset"
import type { UnresolvedMigrationContentRelationshipConfig } from "./types/migration/ContentRelationship"
import { MigrationContentRelationship } from "./types/migration/ContentRelationship"
import { MigrationDocument } from "./types/migration/Document"
import type {
	MigrationDocumentParams,
	MigrationDocumentValue,
} from "./types/migration/Document"
import type { PrismicDocument } from "./types/value/document"
import type { FilledImageFieldImage } from "./types/value/image"
import type { FilledLinkToMediaField } from "./types/value/linkToMedia"

/**
 * Extracts one or more Prismic document types that match a given Prismic
 * document type. If no matches are found, no extraction is performed and the
 * union of all provided Prismic document types are returned.
 *
 * @typeParam TDocuments - Prismic document types from which to extract.
 * @typeParam TDocumentType - Type(s) to match `TDocuments` against.
 */
type ExtractDocumentType<
	TDocuments extends PrismicDocument | MigrationDocumentValue,
	TDocumentType extends TDocuments["type"],
> =
	Extract<TDocuments, { type: TDocumentType }> extends never
		? TDocuments
		: Extract<TDocuments, { type: TDocumentType }>

/**
 * The symbol used to index documents that are singletons.
 */
const SINGLE_INDEX = "__SINGLE__"

/**
 * A helper that allows preparing your migration to Prismic.
 *
 * @typeParam TDocuments - Document types that are registered for the Prismic
 *   repository. Query methods will automatically be typed based on this type.
 */
export class Migration<
	TDocuments extends PrismicDocument = PrismicDocument,
	TMigrationDocuments extends
		MigrationDocumentValue<TDocuments> = MigrationDocumentValue<TDocuments>,
> {
	/**
	 * Assets registered in the migration.
	 *
	 * @internal
	 */
	_assets: Map<MigrationAssetConfig["file"], MigrationAssetConfig> = new Map()

	/**
	 * Documents registered in the migration.
	 *
	 * @internal
	 */
	_documents: MigrationDocument<TDocuments>[] = []

	/**
	 * A map indexing documents by their type and UID used for quick lookups by
	 * the {@link getByUID} and {@link getSingle} methods.
	 */
	#indexedDocuments: Record<
		string,
		Record<string, MigrationDocument<TDocuments>>
	> = {}

	/**
	 * Registers an asset to be created in the migration from an asset object.
	 *
	 * @remarks
	 * This method does not create the asset in Prismic media library right away.
	 * Instead it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param asset - An asset object from Prismic Asset API.
	 *
	 * @returns A migration asset field instance configured to be serialized as an
	 *   image field by default.
	 */
	createAsset(asset: Asset): MigrationImage

	/**
	 * Registers an asset to be created in the migration from an image or link to
	 * media field.
	 *
	 * @remarks
	 * This method does not create the asset in Prismic media library right away.
	 * Instead it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param imageOrLinkToMediaField - An image or link to media field from
	 *   Prismic Document API.
	 *
	 * @returns A migration asset field instance configured to be serialized as an
	 *   image field by default.
	 */
	createAsset(
		imageOrLinkToMediaField: FilledImageFieldImage | FilledLinkToMediaField,
	): MigrationImage

	/**
	 * Registers an asset to be created in the migration from a file.
	 *
	 * @remarks
	 * This method does not create the asset in Prismic media library right away.
	 * Instead it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param file - The URL or content of the file to be created.
	 * @param filename - The filename of the asset.
	 * @param params - Additional asset data.
	 *
	 * @returns A migration asset field instance configured to be serialized as an
	 *   image field by default.
	 */
	createAsset(
		file: MigrationAssetConfig["file"],
		filename: MigrationAssetConfig["filename"],
		params?: {
			notes?: string
			credits?: string
			alt?: string
			tags?: string[]
		},
	): MigrationImage

	/**
	 * Registers an asset to be created in the migration from a file, an asset
	 * object, or an image or link to media field.
	 *
	 * @remarks
	 * This method does not create the asset in Prismic media library right away.
	 * Instead it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @returns A migration asset field instance configured to be serialized as an
	 *   image field by default.
	 */
	createAsset(
		fileOrAssetOrField:
			| MigrationAssetConfig["file"]
			| Asset
			| FilledImageFieldImage
			| FilledLinkToMediaField,
		filename?: MigrationAssetConfig["filename"],
		{
			notes,
			credits,
			alt,
			tags,
		}: {
			notes?: string
			credits?: string
			alt?: string
			tags?: string[]
		} = {},
	): MigrationImage {
		let asset: MigrationAssetConfig
		let maybeInitialField: FilledImageFieldImage | undefined
		if (typeof fileOrAssetOrField === "object" && "url" in fileOrAssetOrField) {
			if (
				"dimensions" in fileOrAssetOrField ||
				"link_type" in fileOrAssetOrField
			) {
				const url = fileOrAssetOrField.url.split("?")[0]
				const filename =
					"name" in fileOrAssetOrField
						? fileOrAssetOrField.name
						: url.split("/").pop()!.split("_").pop()!
				const credits =
					"copyright" in fileOrAssetOrField && fileOrAssetOrField.copyright
						? fileOrAssetOrField.copyright
						: undefined
				const alt =
					"alt" in fileOrAssetOrField && fileOrAssetOrField.alt
						? fileOrAssetOrField.alt
						: undefined

				if ("dimensions" in fileOrAssetOrField) {
					maybeInitialField = fileOrAssetOrField
				}

				asset = {
					id: fileOrAssetOrField.id,
					file: url,
					filename,
					notes: undefined,
					credits,
					alt,
					tags: undefined,
				}
			} else {
				asset = {
					id: fileOrAssetOrField.id,
					file: fileOrAssetOrField.url,
					filename: fileOrAssetOrField.filename,
					notes: fileOrAssetOrField.notes,
					credits: fileOrAssetOrField.credits,
					alt: fileOrAssetOrField.alt,
					tags: fileOrAssetOrField.tags?.map(({ name }) => name),
				}
			}
		} else {
			asset = {
				id: fileOrAssetOrField,
				file: fileOrAssetOrField,
				filename: filename!,
				notes,
				credits,
				alt,
				tags,
			}
		}

		validateAssetMetadata(asset)

		const maybeAsset = this._assets.get(asset.id)

		if (maybeAsset) {
			// Consolidate existing asset with new asset value if possible
			this._assets.set(asset.id, {
				...maybeAsset,
				notes: asset.notes || maybeAsset.notes,
				credits: asset.credits || maybeAsset.credits,
				alt: asset.alt || maybeAsset.alt,
				tags: Array.from(
					new Set([...(maybeAsset.tags || []), ...(asset.tags || [])]),
				),
			})
		} else {
			this._assets.set(asset.id, asset)
		}

		return new MigrationImage(this._assets.get(asset.id)!, maybeInitialField)
	}

	/**
	 * Registers a document to be created in the migration.
	 *
	 * @remarks
	 * This method does not create the document in Prismic right away. Instead it
	 * registers it in your migration. The document will be created when the
	 * migration is executed through the `writeClient.migrate()` method.
	 *
	 * @typeParam TType - Type of Prismic documents to create.
	 *
	 * @param document - The document to create.
	 * @param documentTitle - The title of the document to create which will be
	 *   displayed in the editor.
	 * @param params - Document master language document ID.
	 *
	 * @returns A migration document instance.
	 */
	createDocument<TType extends TMigrationDocuments["type"]>(
		document: ExtractDocumentType<TMigrationDocuments, TType>,
		documentTitle: string,
		params: Omit<MigrationDocumentParams, "documentTitle"> = {},
	): MigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const { record: data, dependencies } = prepareMigrationRecord(
			document.data,
			this.createAsset.bind(this),
		)

		const migrationDocument = new MigrationDocument(
			{ ...document, data },
			{
				documentTitle,
				...params,
			},
			dependencies,
		)

		this._documents.push(migrationDocument)

		// Index document
		if (!(document.type in this.#indexedDocuments)) {
			this.#indexedDocuments[document.type] = {}
		}
		this.#indexedDocuments[document.type][document.uid || SINGLE_INDEX] =
			migrationDocument

		return migrationDocument
	}

	/**
	 * Registers an existing document to be updated in the migration.
	 *
	 * @remarks
	 * This method does not update the document in Prismic right away. Instead it
	 * registers it in your migration. The document will be updated when the
	 * migration is executed through the `writeClient.migrate()` method.
	 *
	 * @typeParam TType - Type of Prismic documents to update.
	 *
	 * @param document - The document to update.
	 * @param documentTitle - The title of the document to update which will be
	 *   displayed in the editor.
	 *
	 * @returns A migration document instance.
	 */
	updateDocument<TType extends TMigrationDocuments["type"]>(
		document: Omit<ExtractDocumentType<TMigrationDocuments, TType>, "id"> & {
			id: string
		},
		documentTitle: string,
	): MigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const migrationDocument = this.createDocument(
			document as ExtractDocumentType<TMigrationDocuments, TType>,
			documentTitle,
		)

		migrationDocument._mode = "update"

		return migrationDocument
	}

	/**
	 * Creates a content relationship fields that can be used in documents to link
	 * to other documents.
	 *
	 * @param config - A Prismic document, a migration document instance, an
	 *   existing content relationship field's content, or a function that returns
	 *   one of the previous.
	 * @param text - Link text associated with the content relationship field.
	 *
	 * @returns A migration content relationship field instance.
	 */
	createContentRelationship(
		config: UnresolvedMigrationContentRelationshipConfig,
		text?: string,
	): MigrationContentRelationship {
		return new MigrationContentRelationship(config, text, undefined)
	}

	/**
	 * Queries a document from the migration instance with a specific UID and
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const contentRelationship = migration.createContentRelationship(() =>
	 * 	migration.getByUID("blog_post", "my-first-post"),
	 * )
	 * ```
	 *
	 * @typeParam TType - Type of the Prismic document returned.
	 *
	 * @param documentType - The API ID of the document's custom type.
	 * @param uid - The UID of the document.
	 *
	 * @returns The migration document instance with a UID matching the `uid`
	 *   parameter, if a matching document is found.
	 */
	getByUID<TType extends TMigrationDocuments["type"]>(
		documentType: TType,
		uid: string,
	): MigrationDocument<ExtractDocumentType<TDocuments, TType>> | undefined {
		return this.#indexedDocuments[documentType]?.[uid] as
			| MigrationDocument
			| undefined
	}

	/**
	 * Queries a singleton document from the migration instance for a specific
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const contentRelationship = migration.createContentRelationship(() =>
	 * 	migration.getSingle("settings"),
	 * )
	 * ```
	 *
	 * @typeParam TType - Type of the Prismic document returned.
	 *
	 * @param documentType - The API ID of the singleton custom type.
	 *
	 * @returns The migration document instance for the custom type, if a matching
	 *   document is found.
	 */
	getSingle<TType extends TMigrationDocuments["type"]>(
		documentType: TType,
	): MigrationDocument<ExtractDocumentType<TDocuments, TType>> | undefined {
		return this.#indexedDocuments[documentType]?.[SINGLE_INDEX] as
			| MigrationDocument
			| undefined
	}
}
