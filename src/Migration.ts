import * as is from "./lib/isValue"
import { validateAssetMetadata } from "./lib/validateAssetMetadata"

import type { Asset } from "./types/api/asset/asset"
import type {
	MigrationAssetConfig,
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "./types/migration/Asset"
import { PrismicMigrationAsset } from "./types/migration/Asset"
import type { MigrationContentRelationship } from "./types/migration/ContentRelationship"
import { PrismicMigrationDocument } from "./types/migration/Document"
import type {
	ExistingPrismicDocument,
	PendingPrismicDocument,
} from "./types/migration/Document"
import type { PrismicDocument } from "./types/value/document"
import type { FilledImageFieldImage } from "./types/value/image"
import { type FilledLinkToWebField, LinkType } from "./types/value/link"
import type { FilledLinkToMediaField } from "./types/value/linkToMedia"
import { RichTextNodeType } from "./types/value/richText"

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
	_assets: Map<MigrationAssetConfig["file"], PrismicMigrationAsset> = new Map()

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
	 * Instead, it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param asset - An asset object from Prismic Asset API.
	 *
	 * @returns A migration asset field instance.
	 *
	 * @internal
	 */
	createAsset(asset: Asset): PrismicMigrationAsset

	/**
	 * Registers an asset to be created in the migration from an image or link to
	 * media field.
	 *
	 * @remarks
	 * This method does not create the asset in Prismic media library right away.
	 * Instead, it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param imageOrLinkToMediaField - An image or link to media field from
	 *   Prismic Document API.
	 *
	 * @returns A migration asset field instance.
	 *
	 * @internal
	 */
	createAsset(
		imageOrLinkToMediaField: FilledImageFieldImage | FilledLinkToMediaField,
	): PrismicMigrationAsset

	/**
	 * Registers an asset to be created in the migration from a file.
	 *
	 * @remarks
	 * This method does not create the asset in Prismic media library right away.
	 * Instead, it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param file - The URL or content of the file to be created.
	 * @param filename - The filename of the asset.
	 * @param params - Additional asset data.
	 *
	 * @returns A migration asset field instance.
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
	): PrismicMigrationAsset

	/**
	 * Registers an asset to be created in the migration from a file, an asset
	 * object, or an image or link to media field.
	 *
	 * @remarks
	 * This method does not create the asset in Prismic media library right away.
	 * Instead, it registers it in your migration. The asset will be created when
	 * the migration is executed through the `writeClient.migrate()` method.
	 *
	 * @returns A migration asset field instance.
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
	): PrismicMigrationAsset {
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

		// We create a detached instance of the asset each time to serialize it properly
		const migrationAsset = new PrismicMigrationAsset(config, maybeInitialField)

		const maybeAsset = this._assets.get(config.id)
		if (maybeAsset) {
			// Consolidate existing asset with new asset value if possible
			maybeAsset.config.notes = maybeAsset.config.notes || config.notes
			maybeAsset.config.credits = maybeAsset.config.credits || config.credits
			maybeAsset.config.alt = maybeAsset.config.alt || config.alt
			maybeAsset.config.tags = Array.from(
				new Set([...(maybeAsset.config.tags || []), ...(config.tags || [])]),
			)
		} else {
			this._assets.set(config.id, migrationAsset)
		}

		return migrationAsset
	}

	/**
	 * Registers a document to be created in the migration.
	 *
	 * @remarks
	 * This method does not create the document in Prismic right away. Instead, it
	 * registers it in your migration. The document will be created when the
	 * migration is executed through the `writeClient.migrate()` method.
	 *
	 * @typeParam TType - Type of the Prismic document to create.
	 *
	 * @param document - The document to create.
	 * @param title - The title of the document to create which will be displayed
	 *   in the editor.
	 * @param params - Document master language document ID.
	 *
	 * @returns A migration document instance.
	 */
	createDocument<TType extends TDocuments["type"]>(
		document: ExtractDocumentType<PendingPrismicDocument<TDocuments>, TType>,
		title: string,
		params?: {
			masterLanguageDocument?: MigrationContentRelationship
		},
	): PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const doc = new PrismicMigrationDocument<
			ExtractDocumentType<TDocuments, TType>
		>(document, title, params)

		this._documents.push(doc)

		return doc
	}

	/**
	 * Registers an existing document to be updated in the migration.
	 *
	 * @remarks
	 * This method does not update the document in Prismic right away. Instead, it
	 * registers it in your migration. The document will be updated when the
	 * migration is executed through the `writeClient.migrate()` method.
	 *
	 * @typeParam TType - Type of Prismic documents to update.
	 *
	 * @param document - The document to update.
	 * @param title - The title of the document to update which will be displayed
	 *   in the editor.
	 *
	 * @returns A migration document instance.
	 */
	updateDocument<TType extends TDocuments["type"]>(
		document: ExtractDocumentType<ExistingPrismicDocument<TDocuments>, TType>,
		// Title is optional for existing documents as we might not want to update it.
		title?: string,
	): PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const doc = new PrismicMigrationDocument<
			ExtractDocumentType<TDocuments, TType>
		>(document, title)

		this._documents.push(doc)

		return doc
	}

	/**
	 * Registers a document from another Prismic repository to be created in the
	 * migration.
	 *
	 * @remarks
	 * This method does not create the document in Prismic right away. Instead, it
	 * registers it in your migration. The document will be created when the
	 * migration is executed through the `writeClient.migrate()` method.
	 *
	 * @param document - The document from Prismic to create.
	 * @param title - The title of the document to create which will be displayed
	 *   in the editor.
	 *
	 * @returns A migration document instance.
	 */
	createDocumentFromPrismic<TType extends TDocuments["type"]>(
		document: ExtractDocumentType<ExistingPrismicDocument<TDocuments>, TType>,
		title: string,
	): PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>> {
		const doc = new PrismicMigrationDocument(
			this.#migratePrismicDocumentData({
				type: document.type,
				lang: document.lang,
				uid: document.uid,
				tags: document.tags,
				data: document.data,
			}) as PendingPrismicDocument<ExtractDocumentType<TDocuments, TType>>,
			title,
			{ originalPrismicDocument: document },
		)

		this._documents.push(doc)

		return doc
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
	 * Migrates a Prismic document data from another repository so that it can be
	 * created through the current repository's Migration API.
	 *
	 * @param input - The Prismic document data to migrate.
	 *
	 * @returns The migrated Prismic document data.
	 */
	#migratePrismicDocumentData(input: unknown): unknown {
		if (is.filledContentRelationship(input)) {
			if (input.isBroken) {
				return {
					link_type: LinkType.Document,
					// ID needs to be 16 characters long to be considered valid by the API
					id: "_____broken_____",
					isBroken: true,
					text: input.text,
				}
			}

			return {
				link_type: LinkType.Document,
				id: () => this._getByOriginalID(input.id),
				text: input.text,
			}
		}

		if (is.filledLinkToMedia(input)) {
			return {
				link_type: LinkType.Media,
				id: this.createAsset(input),
				text: input.text,
			}
		}

		if (is.rtImageNode(input)) {
			// Rich text image nodes
			const rtImageNode: MigrationRTImageNode = {
				type: RichTextNodeType.image,
				id: this.createAsset(input),
			}

			if (input.linkTo) {
				rtImageNode.linkTo = this.#migratePrismicDocumentData(input.linkTo) as
					| MigrationContentRelationship
					| MigrationLinkToMedia
					| FilledLinkToWebField
			}

			return rtImageNode
		}

		if (is.filledImage(input)) {
			const image: MigrationImage = {
				id: this.createAsset(input),
			}

			const {
				id: _id,
				url: _url,
				dimensions: _dimensions,
				edit: _edit,
				alt: _alt,
				copyright: _copyright,
				...thumbnails
			} = input

			for (const name in thumbnails) {
				if (is.filledImage(thumbnails[name])) {
					image[name] = this.createAsset(thumbnails[name])
				}
			}

			return image
		}

		if (Array.isArray(input)) {
			return input.map((element) => this.#migratePrismicDocumentData(element))
		}

		if (input && typeof input === "object") {
			const res: Record<PropertyKey, unknown> = {}

			for (const key in input) {
				res[key] = this.#migratePrismicDocumentData(
					input[key as keyof typeof input],
				)
			}

			return res
		}

		return input
	}

	/**
	 * Queries a document from the migration instance for a specific original ID.
	 *
	 * @example
	 *
	 * ```ts
	 * const contentRelationship = migration.createContentRelationship(() =>
	 * 	migration._getByOriginalID("YhdrDxIAACgAcp_b"),
	 * )
	 * ```
	 *
	 * @typeParam TType - Type of the Prismic document returned.
	 *
	 * @param id - The original ID of the Prismic document.
	 *
	 * @returns The migration document instance for the original ID, if a matching
	 *   document is found.
	 *
	 * @internal
	 */
	_getByOriginalID<TType extends TDocuments["type"]>(
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
