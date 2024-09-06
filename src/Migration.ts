import * as is from "./lib/isMigrationField"

import type { Asset } from "./types/api/asset/asset"
import type { MigrationAsset } from "./types/migration/asset"
import type {
	FieldsToMigrationFields,
	PrismicMigrationDocument,
	PrismicMigrationDocumentParams,
} from "./types/migration/document"
import {
	type ImageMigrationField,
	type LinkToMediaMigrationField,
	MigrationFieldType,
} from "./types/migration/fields"
import type { PrismicDocument } from "./types/value/document"
import type { GroupField } from "./types/value/group"
import type { FilledImageFieldImage } from "./types/value/image"
import { LinkType } from "./types/value/link"
import type { FilledLinkToMediaField } from "./types/value/linkToMedia"
import { RichTextNodeType } from "./types/value/richText"
import type { SliceZone } from "./types/value/sliceZone"
import type { AnyRegularField } from "./types/value/types"

import * as isFilled from "./helpers/isFilled"

import { validateAssetMetadata } from "./WriteClient"

/**
 * Discovers assets in a record of Prismic fields.
 *
 * @param record - Record of Prismic fields to loook for assets in.
 * @param onAsset - Callback that is called for each asset found.
 */
const discoverAssets = (
	record: FieldsToMigrationFields<
		Record<string, AnyRegularField | GroupField | SliceZone>
	>,
	onAsset: (asset: FilledImageFieldImage | FilledLinkToMediaField) => void,
) => {
	for (const field of Object.values(record)) {
		if (is.sliceZone(field)) {
			for (const slice of field) {
				discoverAssets(slice.primary, onAsset)
				for (const item of slice.items) {
					discoverAssets(item, onAsset)
				}
			}
		} else if (is.richText(field)) {
			for (const node of field) {
				if ("type" in node) {
					if (node.type === RichTextNodeType.image) {
						onAsset(node)
						if (
							node.linkTo &&
							"link_type" in node.linkTo &&
							node.linkTo.link_type === LinkType.Media
						) {
							onAsset(node.linkTo)
						}
					} else if (node.type !== RichTextNodeType.embed) {
						for (const span of node.spans) {
							if (
								span.type === "hyperlink" &&
								span.data &&
								"link_type" in span.data &&
								span.data.link_type === LinkType.Media
							) {
								onAsset(span.data)
							}
						}
					}
				}
			}
		} else if (is.group(field)) {
			for (const item of field) {
				discoverAssets(item, onAsset)
			}
		} else if (
			is.image(field) &&
			field &&
			"dimensions" in field &&
			isFilled.image(field)
		) {
			onAsset(field)
		} else if (
			is.link(field) &&
			field &&
			"link_type" in field &&
			field.link_type === LinkType.Media &&
			isFilled.linkToMedia(field)
		) {
			onAsset(field)
		}
	}
}

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
	TMigrationDocuments extends PrismicMigrationDocument,
	TType extends TMigrationDocuments["type"],
> =
	Extract<TMigrationDocuments, { type: TType }> extends never
		? TMigrationDocuments
		: Extract<TMigrationDocuments, { type: TType }>

type CreateAssetReturnType = ImageMigrationField & {
	image: ImageMigrationField
	linkToMedia: LinkToMediaMigrationField
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
		PrismicMigrationDocument<TDocuments> = PrismicMigrationDocument<TDocuments>,
> {
	/**
	 * @internal
	 */
	documents: {
		document: TMigrationDocuments
		params: PrismicMigrationDocumentParams
	}[] = []
	#indexedDocuments: Record<string, Record<string, TMigrationDocuments>> = {}

	/**
	 * @internal
	 */
	assets: Map<MigrationAsset["file"], MigrationAsset> = new Map()

	createAsset(
		asset: Asset | FilledImageFieldImage | FilledLinkToMediaField,
	): CreateAssetReturnType
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
		fileOrAsset:
			| MigrationAsset["file"]
			| Asset
			| FilledImageFieldImage
			| FilledLinkToMediaField,
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
			if ("dimensions" in fileOrAsset || "link_type" in fileOrAsset) {
				const url = fileOrAsset.url.split("?")[0]
				const filename =
					"name" in fileOrAsset
						? fileOrAsset.name
						: url.split("/").pop()?.split("_").pop() ||
							fileOrAsset.alt ||
							"unknown"
				const credits =
					"copyright" in fileOrAsset && fileOrAsset.copyright
						? fileOrAsset.copyright
						: undefined
				const alt =
					"alt" in fileOrAsset && fileOrAsset.alt ? fileOrAsset.alt : undefined

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

		const maybeAsset = this.assets.get(asset.id)

		if (maybeAsset) {
			// Consolidate existing asset with new asset value if possible
			this.assets.set(asset.id, {
				...maybeAsset,
				notes: asset.notes || maybeAsset.notes,
				credits: asset.credits || maybeAsset.credits,
				alt: asset.alt || maybeAsset.alt,
				tags: Array.from(
					new Set([...(maybeAsset.tags || []), ...(asset.tags || [])]),
				),
			})
		} else {
			this.assets.set(asset.id, asset)
		}

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
		documentName: PrismicMigrationDocumentParams["documentName"],
		params: Omit<PrismicMigrationDocumentParams, "documentName"> = {},
	): ExtractMigrationDocumentType<TMigrationDocuments, TType> {
		this.documents.push({
			document,
			params: { documentName, ...params },
		})

		// Index document
		if (!(document.type in this.#indexedDocuments)) {
			this.#indexedDocuments[document.type] = {}
		}
		this.#indexedDocuments[document.type][document.uid || SINGLE_KEY] = document

		// Find other assets in document
		discoverAssets(document.data, this.createAsset.bind(this))

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
