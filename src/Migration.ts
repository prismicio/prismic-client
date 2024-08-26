import type { Asset } from "./types/api/asset/asset"
import type { MigrationAsset } from "./types/migration/asset"
import type {
	MigrationPrismicDocument,
	MigrationPrismicDocumentParams,
} from "./types/migration/document"
import {
	MigrationFieldType,
	type MigrationImageField,
	type MigrationLinkToMediaField,
} from "./types/migration/fields"
import type { PrismicDocument } from "./types/value/document"

/**
 * Extracts one or more Prismic document types that match a given Prismic
 * document type. If no matches are found, no extraction is performed and the
 * union of all provided Prismic document types are returned.
 *
 * @typeParam TMigrationDocuments - Prismic migration document types from which
 *   to extract.
 * @typeParam TType - Type(s) to match `TMigrationDocuments` against.
 */
type ExtractMigrationDocumentType<
	TMigrationDocuments extends MigrationPrismicDocument,
	TType extends TMigrationDocuments["type"],
> =
	Extract<TMigrationDocuments, { type: TType }> extends never
		? TMigrationDocuments
		: Extract<TMigrationDocuments, { type: TType }>

type CreateAssetReturnType = MigrationImageField & {
	image: MigrationImageField
	linkToMedia: MigrationLinkToMediaField
}

const SINGLE_KEY = "__SINGLE__"

/**
 * A helper that allows preparing your migration to Prismic.
 *
 * @typeParam TDocuments - Document types that are registered for the Prismic
 *   repository. Query methods will automatically be typed based on this type.
 */
export class Migration<
	TDocuments extends PrismicDocument = PrismicDocument,
	TMigrationDocuments extends
		MigrationPrismicDocument<TDocuments> = MigrationPrismicDocument<TDocuments>,
> {
	/**
	 * @internal
	 */
	documents: {
		document: TMigrationDocuments
		params: MigrationPrismicDocumentParams
	}[] = []
	#indexedDocuments: Record<string, Record<string, TMigrationDocuments>> = {}

	/**
	 * @internal
	 */
	assets: Map<MigrationAsset["file"], MigrationAsset> = new Map()

	constructor() {}

	createAsset(asset: Asset): CreateAssetReturnType
	createAsset(
		file: MigrationAsset["file"],
		filename: MigrationAsset["filename"],
		params?: {
			notes?: string
			credits?: string
			alt?: string
			tags?: string[]
		},
	): CreateAssetReturnType
	createAsset(
		fileOrAsset: MigrationAsset["file"] | Asset,
		filename?: MigrationAsset["filename"],
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
	): CreateAssetReturnType {
		let asset: MigrationAsset
		if (typeof fileOrAsset === "object" && "url" in fileOrAsset) {
			asset = {
				id: fileOrAsset.id,
				file: fileOrAsset.url,
				filename: fileOrAsset.filename,
				notes: fileOrAsset.notes,
				credits: fileOrAsset.credits,
				alt: fileOrAsset.alt,
				tags: fileOrAsset.tags?.map(({ name }) => name),
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

		this.assets.set(asset.id, asset)

		return {
			migrationType: MigrationFieldType.Image,
			...asset,
			image: {
				migrationType: MigrationFieldType.Image,
				...asset,
			},
			linkToMedia: {
				migrationType: MigrationFieldType.LinkToMedia,
				...asset,
			},
		}
	}

	createDocument<TType extends TMigrationDocuments["type"]>(
		document: ExtractMigrationDocumentType<TMigrationDocuments, TType>,
		documentName: MigrationPrismicDocumentParams["documentName"],
		params: Omit<MigrationPrismicDocumentParams, "documentName"> = {},
	): ExtractMigrationDocumentType<TMigrationDocuments, TType> {
		this.documents.push({
			document,
			params: { documentName, ...params },
		})

		if (!(document.type in this.#indexedDocuments)) {
			this.#indexedDocuments[document.type] = {}
		}
		this.#indexedDocuments[document.type][document.uid || SINGLE_KEY] = document

		return document
	}

	getByUID<
		TType extends TMigrationDocuments["type"],
		TMigrationDocument extends Extract<
			TMigrationDocuments,
			{ type: TType }
		> = Extract<TMigrationDocuments, { type: TType }>,
	>(documentType: TType, uid: string): TMigrationDocument | undefined {
		return this.#indexedDocuments[documentType]?.[uid] as
			| TMigrationDocument
			| undefined
	}

	getSingle<
		TType extends TMigrationDocuments["type"],
		TMigrationDocument extends Extract<
			TMigrationDocuments,
			{ type: TType }
		> = Extract<TMigrationDocuments, { type: TType }>,
	>(documentType: TType): TMigrationDocument | undefined | undefined {
		return this.#indexedDocuments[documentType]?.[SINGLE_KEY] as
			| TMigrationDocument
			| undefined
	}
}
