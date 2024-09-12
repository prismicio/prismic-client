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
	 * @internal
	 */
	_assets: Map<MigrationAssetConfig["file"], MigrationAssetConfig> = new Map()

	/**
	 * @internal
	 */
	_documents: MigrationDocument<TDocuments>[] = []
	#indexedDocuments: Record<
		string,
		Record<string, MigrationDocument<TDocuments>>
	> = {}

	createAsset(
		asset: Asset | FilledImageFieldImage | FilledLinkToMediaField,
	): MigrationImage
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
	createAsset(
		fileOrAsset:
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
		if (typeof fileOrAsset === "object" && "url" in fileOrAsset) {
			if ("dimensions" in fileOrAsset || "link_type" in fileOrAsset) {
				const url = fileOrAsset.url.split("?")[0]
				const filename =
					"name" in fileOrAsset
						? fileOrAsset.name
						: url.split("/").pop()!.split("_").pop()!
				const credits =
					"copyright" in fileOrAsset && fileOrAsset.copyright
						? fileOrAsset.copyright
						: undefined
				const alt =
					"alt" in fileOrAsset && fileOrAsset.alt ? fileOrAsset.alt : undefined

				if ("dimensions" in fileOrAsset) {
					maybeInitialField = fileOrAsset
				}

				asset = {
					id: fileOrAsset.id,
					file: url,
					filename,
					notes: undefined,
					credits,
					alt,
					tags: undefined,
				}
			} else {
				asset = {
					id: fileOrAsset.id,
					file: fileOrAsset.url,
					filename: fileOrAsset.filename,
					notes: fileOrAsset.notes,
					credits: fileOrAsset.credits,
					alt: fileOrAsset.alt,
					tags: fileOrAsset.tags?.map(({ name }) => name),
				}
			}
		} else {
			asset = {
				id: fileOrAsset,
				file: fileOrAsset,
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

	createContentRelationship(
		config: UnresolvedMigrationContentRelationshipConfig,
		text?: string,
	): MigrationContentRelationship {
		return new MigrationContentRelationship(config, undefined, text)
	}

	getByUID<TType extends TMigrationDocuments["type"]>(
		documentType: TType,
		uid: string,
	): MigrationDocument<ExtractDocumentType<TDocuments, TType>> | undefined {
		return this.#indexedDocuments[documentType]?.[uid] as
			| MigrationDocument
			| undefined
	}

	getSingle<TType extends TMigrationDocuments["type"]>(
		documentType: TType,
	): MigrationDocument<ExtractDocumentType<TDocuments, TType>> | undefined {
		return this.#indexedDocuments[documentType]?.[SINGLE_INDEX] as
			| MigrationDocument
			| undefined
	}
}
