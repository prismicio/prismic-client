import { prepareMigrationDocumentData } from "./lib/prepareMigrationDocumentData"
import { validateAssetMetadata } from "./lib/validateAssetMetadata"

import type { Asset } from "./types/api/asset/asset"
import type { MigrationAssetConfig } from "./types/migration/Asset"
import type { MigrationAsset } from "./types/migration/Asset"
import { MigrationImage } from "./types/migration/Asset"
import type { UnresolvedMigrationContentRelationshipConfig } from "./types/migration/ContentRelationship"
import { MigrationContentRelationship } from "./types/migration/ContentRelationship"
import { PrismicMigrationDocument } from "./types/migration/Document"
import type {
	ExistingPrismicDocument,
	PendingPrismicDocument,
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
	TDocuments extends { type: string },
	TDocumentType extends TDocuments["type"],
> =
	Extract<TDocuments, { type: TDocumentType }> extends never
		? TDocuments
		: Extract<TDocuments, { type: TDocumentType }>

/**
 * A helper that allows preparing your migration to Prismic.
 *
 * @typeParam TDocuments - Document types that are registered for the Prismic
 *   repository. Query methods will automatically be typed based on this type.
 */
export class Migration<TDocuments extends PrismicDocument = PrismicDocument> {
	/**
	 * Assets registered in the migration.
	 *
	 * @internal
	 */
	_assets: Map<MigrationAssetConfig["file"], MigrationAsset> = new Map()

	/**
	 * Documents registered in the migration.
	 *
	 * @internal
	 */
	_documents: PrismicMigrationDocument<TDocuments>[] = []

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
		let config: MigrationAssetConfig
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

				config = {
					id: fileOrAssetOrField.id,
					file: url,
					filename,
					notes: undefined,
					credits,
					alt,
					tags: undefined,
				}
			} else {
				config = {
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
			config = {
				id: fileOrAssetOrField,
				file: fileOrAssetOrField,
				filename: filename!,
				notes,
				credits,
				alt,
				tags,
			}
		}

		validateAssetMetadata(config)
		const migrationAsset = new MigrationImage(config, maybeInitialField)

		const maybeAsset = this._assets.get(config.id)
		if (maybeAsset) {
			// Consolidate existing asset with new asset value if possible
			maybeAsset.config.notes = config.notes || maybeAsset.config.notes
			maybeAsset.config.credits = config.credits || maybeAsset.config.credits
			maybeAsset.config.alt = config.alt || maybeAsset.config.alt
			maybeAsset.config.tags = Array.from(
				new Set([...(config.tags || []), ...(maybeAsset.config.tags || [])]),
			)
		} else {
			this._assets.set(config.id, migrationAsset)
		}

		// We returned a detached instance of the asset to serialize it properly
		return migrationAsset
	}

	/**
	 * Registers a document to be created in the migration.
	 *
	 * @remarks
	 * This method does not create the document in Prismic right away. Instead it
	 * registers it in your migration. The document will be created when the
	 * migration is executed through the `writeClient.migrate()` method.
	 *
	 * @typeParam TType - Type of the Prismic document to create.
	 *
	 * @param document - The document to create.
	 * @param title - The title of the document to create which will be displayed
	 *   in the editor.
	 * @param options - Document master language document ID.
	 *
	 * @returns A migration document instance.
	 */
	createDocument<TType extends TDocuments["type"]>(
		document: ExtractDocumentType<PendingPrismicDocument<TDocuments>, TType>,
		title: string,
		options?: {
			masterLanguageDocument?: MigrationContentRelationship
		},
	): PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const { record: data, dependencies } = prepareMigrationDocumentData(
			document.data!,
			this.createAsset.bind(this),
		)

		const doc = new PrismicMigrationDocument<
			ExtractDocumentType<TDocuments, TType>
		>({ ...document, data }, title, { ...options, dependencies })

		this._documents.push(doc)

		return doc
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
	updateDocument<TType extends TDocuments["type"]>(
		document: ExtractDocumentType<ExistingPrismicDocument<TDocuments>, TType>,
		title: string,
	): PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const { record: data, dependencies } = prepareMigrationDocumentData(
			document.data,
			this.createAsset.bind(this),
		)

		const doc = new PrismicMigrationDocument<
			ExtractDocumentType<TDocuments, TType>
		>({ ...document, data }, title, { dependencies })

		this._documents.push(doc)

		return doc
	}

	/**
	 * Registers a document to be created in the migration.
	 *
	 * @remarks
	 * This method does not create the document in Prismic right away. Instead it
	 * registers it in your migration. The document will be created when the
	 * migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param document - The document to create.
	 * @param title - The title of the document to create which will be displayed
	 *   in the editor.
	 * @param options - Document master language document ID.
	 *
	 * @returns A migration document instance.
	 */
	createDocumentFromPrismic<TType extends TDocuments["type"]>(
		document: ExtractDocumentType<ExistingPrismicDocument<TDocuments>, TType>,
		title: string,
	): PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const { record: data, dependencies } = prepareMigrationDocumentData(
			document.data,
			this.createAsset.bind(this),
		)

		const doc = new PrismicMigrationDocument(
			{
				type: document.type,
				lang: document.lang,
				uid: document.uid,
				tags: document.tags,
				data: data,
			} as unknown as PendingPrismicDocument<
				ExtractDocumentType<TDocuments, TType>
			>,
			title,
			{ originalPrismicDocument: document, dependencies },
		)

		this._documents.push(doc)

		return doc
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
	 * @param type - The API ID of the document's custom type.
	 * @param uid - The UID of the document.
	 *
	 * @returns The migration document instance with a UID matching the `uid`
	 *   parameter, if a matching document is found.
	 */
	getByUID<TType extends TDocuments["type"]>(
		type: TType,
		uid: string,
	):
		| PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>>
		| undefined {
		return this._documents.find(
			(
				doc,
			): doc is PrismicMigrationDocument<
				ExtractDocumentType<TDocuments, TType>
			> => doc.document.type === type && doc.document.uid === uid,
		)
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
	 * @param type - The API ID of the singleton custom type.
	 *
	 * @returns The migration document instance for the custom type, if a matching
	 *   document is found.
	 */
	getSingle<TType extends TDocuments["type"]>(
		type: TType,
	):
		| PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>>
		| undefined {
		return this._documents.find(
			(
				doc,
			): doc is PrismicMigrationDocument<
				ExtractDocumentType<TDocuments, TType>
			> => doc.document.type === type,
		)
	}

	/**
	 * Queries a document from the migration instance for a specific original ID.
	 *
	 * @example
	 *
	 * ```ts
	 * const contentRelationship = migration.createContentRelationship(() =>
	 * 	migration.getByOriginalID("YhdrDxIAACgAcp_b"),
	 * )
	 * ```
	 *
	 * @typeParam TType - Type of the Prismic document returned.
	 *
	 * @param id - The original ID of the Prismic document.
	 *
	 * @returns The migration document instance for the original ID, if a matching
	 *   document is found.
	 */
	getByOriginalID<TType extends TDocuments["type"]>(
		id: string,
	):
		| PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>>
		| undefined {
		return this._documents.find(
			(
				doc,
			): doc is PrismicMigrationDocument<
				ExtractDocumentType<TDocuments, TType>
			> => doc.originalPrismicDocument?.id === id,
		)
	}
}
