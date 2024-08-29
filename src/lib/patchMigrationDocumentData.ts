import type { Asset } from "../types/api/asset/asset"
import type { MigrationAsset } from "../types/migration/asset"
import type {
	FieldsToMigrationFields,
	GroupFieldToMigrationField,
	PrismicMigrationDocument,
	RichTextFieldToMigrationField,
	SliceZoneToMigrationField,
} from "../types/migration/document"
import type {
	ImageMigrationField,
	LinkMigrationField,
} from "../types/migration/fields"
import { MigrationFieldType } from "../types/migration/fields"
import type { PrismicDocument } from "../types/value/document"
import type { GroupField, NestedGroupField } from "../types/value/group"
import type { FilledImageFieldImage, ImageField } from "../types/value/image"
import { LinkType } from "../types/value/link"
import type { LinkField } from "../types/value/link"
import type { RTInlineNode } from "../types/value/richText"
import { type RichTextField, RichTextNodeType } from "../types/value/richText"
import type { SharedSlice } from "../types/value/sharedSlice"
import type { Slice } from "../types/value/slice"
import type { SliceZone } from "../types/value/sliceZone"
import type { AnyRegularField } from "../types/value/types"

import * as isFilled from "../helpers/isFilled"

import * as is from "./isMigrationField"
import * as to from "./toField"

/**
 * A map of asset IDs to asset used to resolve assets when patching migration
 * Prismic documents.
 *
 * @internal
 */
export type AssetMap = Map<MigrationAsset["id"], Asset>

/**
 * A map of document IDs, documents, and migraiton documents to content
 * relationship field used to resolve content relationships when patching
 * migration Prismic documents.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @internal
 */
export type DocumentMap<TDocuments extends PrismicDocument = PrismicDocument> =
	Map<
		| string
		| TDocuments
		| PrismicMigrationDocument
		| PrismicMigrationDocument<TDocuments>,
		| PrismicDocument
		| (Omit<PrismicMigrationDocument<PrismicDocument>, "id"> & { id: string })
	>

/**
 * Inherits query parameters from an original URL to a new URL.
 *
 * @param url - The new URL.
 * @param original - The original URL to inherit query parameters from.
 *
 * @returns The new URL with query parameters inherited from the original URL.
 */
const inheritQueryParams = (url: string, original: string): string => {
	const queryParams = original.split("?")[1] || ""

	return `${url.split("?")[0]}${queryParams ? `?${queryParams}` : ""}`
}

/**
 * Patches references in a slice zone field.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @param sliceZone - The slice zone to patch.
 * @param assets - A map of assets available in the Prismic repository.
 * @param documents - A map of documents available in the Prismic repository.
 *
 * @returns The patched slice zone.
 */
const patchSliceZone = async <
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	sliceZone: SliceZoneToMigrationField<SliceZone>,
	assets: AssetMap,
	documents: DocumentMap<TDocuments>,
): Promise<SliceZone> => {
	const result = [] as unknown as SliceZone<Slice | SharedSlice, "filled">

	for (const slice of sliceZone) {
		const { primary, items, ...properties } = slice
		const patchedPrimary = await patchRecord(
			// We cast to `Slice["primary"]` which is stricter than `SharedSlice["primary"]`
			// otherwise TypeScript gets confused while creating the patched slice below.
			primary as Slice["primary"],
			assets,
			documents,
		)
		const patchedItems = await patchGroup(items, assets, documents)

		result.push({
			...properties,
			primary: patchedPrimary,
			items: patchedItems,
		})
	}

	return result
}

/**
 * Patches references in a rich text field.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @param richText - The rich text field to patch.
 * @param assets - A map of assets available in the Prismic repository.
 * @param documents - A map of documents available in the Prismic repository.
 *
 * @returns The patched rich text field.
 */
const patchRichText = async <
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	richText: RichTextFieldToMigrationField<RichTextField>,
	assets: AssetMap,
	documents: DocumentMap<TDocuments>,
): Promise<RichTextField> => {
	const result = [] as unknown as RichTextField<"filled">

	for (const node of richText) {
		if ("type" in node && typeof node.type === "string") {
			if (node.type === RichTextNodeType.embed) {
				result.push(node)
			} else if (node.type === RichTextNodeType.image) {
				const image = patchImage(node, assets)

				if (isFilled.image(image)) {
					const linkTo = await patchLink(node.linkTo, assets, documents)

					result.push({
						...image,
						type: RichTextNodeType.image,
						linkTo: isFilled.link(linkTo) ? linkTo : undefined,
					})
				}
			} else {
				const { spans, ...properties } = node

				const patchedSpans: RTInlineNode[] = []

				for (const span of spans) {
					if (span.type === RichTextNodeType.hyperlink) {
						const data = await patchLink(span.data, assets, documents)

						if (isFilled.link(data)) {
							patchedSpans.push({ ...span, data })
						}
					} else {
						patchedSpans.push(span)
					}
				}

				result.push({
					...properties,
					spans: patchedSpans,
				})
			}
		} else {
			// Migration image node
			const asset = assets.get(node.id)

			const linkTo = await patchLink(node.linkTo, assets, documents)

			if (asset) {
				result.push({
					...to.rtImageNode(asset),
					linkTo: isFilled.link(linkTo) ? linkTo : undefined,
				})
			}
		}
	}

	return result
}

/**
 * Patches references in a group field.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @param group - The group field to patch.
 * @param assets - A map of assets available in the Prismic repository.
 * @param documents - A map of documents available in the Prismic repository.
 *
 * @returns The patched group field.
 */
const patchGroup = async <
	TMigrationGroup extends GroupFieldToMigrationField<
		GroupField | Slice["items"] | SharedSlice["items"]
	>,
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	group: TMigrationGroup,
	assets: AssetMap,
	documents: DocumentMap<TDocuments>,
): Promise<
	TMigrationGroup extends GroupFieldToMigrationField<infer TGroup>
		? TGroup
		: never
> => {
	const result = [] as unknown as GroupField<
		Record<string, AnyRegularField | NestedGroupField>,
		"filled"
	>

	for (const item of group) {
		const patched = await patchRecord(item, assets, documents)

		result.push(patched)
	}

	return result as TMigrationGroup extends GroupFieldToMigrationField<
		infer TGroup
	>
		? TGroup
		: never
}

/**
 * Patches references in a link field.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @param link - The link field to patch.
 * @param assets - A map of assets available in the Prismic repository.
 * @param documents - A map of documents available in the Prismic repository.
 *
 * @returns The patched link field.
 */
const patchLink = async <TDocuments extends PrismicDocument = PrismicDocument>(
	link: LinkMigrationField | LinkField,
	assets: AssetMap,
	documents: DocumentMap<TDocuments>,
): Promise<LinkField> => {
	if (link) {
		if (typeof link === "function") {
			const resolved = await link()

			if (resolved) {
				// Documents and migration documents are indexed.
				const maybeRelationship = documents.get(resolved)

				if (maybeRelationship) {
					return to.contentRelationship(maybeRelationship)
				}
			}
		} else if ("migrationType" in link) {
			// Migration link field
			const asset = assets.get(link.id)
			if (asset) {
				return to.linkToMediaField(asset)
			}
		} else if ("link_type" in link) {
			switch (link.link_type) {
				case LinkType.Document:
					// Existing content relationship
					if (isFilled.contentRelationship(link)) {
						const id = documents.get(link.id)?.id
						if (id) {
							return { ...link, id }
						} else {
							return { ...link, isBroken: true }
						}
					}
				case LinkType.Media:
					// Existing link to media
					if (isFilled.linkToMedia(link)) {
						const id = assets.get(link.id)?.id
						if (id) {
							return { ...link, id }
						}
						break
					}
				case LinkType.Web:
				default:
					return link
			}
		} else {
			const maybeRelationship = documents.get(link.id)

			if (maybeRelationship) {
				return to.contentRelationship(maybeRelationship)
			}
		}
	}

	return {
		link_type: LinkType.Any,
	}
}

/**
 * Patches references in an image field.
 *
 * @param image - The image field to patch.
 * @param assets - A map of assets available in the Prismic repository.
 *
 * @returns The patched image field.
 */
const patchImage = (
	image: ImageMigrationField | ImageField,
	assets: AssetMap,
): ImageField => {
	if (image) {
		if (
			"migrationType" in image &&
			image.migrationType === MigrationFieldType.Image
		) {
			// Migration image field
			const asset = assets.get(image.id)
			if (asset) {
				return to.imageField(asset)
			}
		} else if (
			"dimensions" in image &&
			image.dimensions &&
			isFilled.image(image)
		) {
			// Regular image field
			const {
				id,
				url,
				dimensions,
				edit,
				alt,
				copyright: _,
				...thumbnails
			} = image
			const asset = assets.get(id)

			if (asset) {
				const result = {
					id: asset.id,
					url: inheritQueryParams(asset.url, url),
					dimensions,
					edit,
					alt: alt || null,
					copyright: asset.credits || null,
				} as ImageField<string>

				if (Object.keys(thumbnails).length > 0) {
					for (const name in thumbnails) {
						const maybeThumbnail = (
							thumbnails as Record<string, FilledImageFieldImage>
						)[name]

						if (is.image(maybeThumbnail)) {
							const { url, dimensions, edit, alt } = (
								thumbnails as Record<string, FilledImageFieldImage>
							)[name]

							result[name] = {
								id: asset.id,
								url: inheritQueryParams(asset.url, url),
								dimensions,
								edit,
								alt: alt || null,
								copyright: asset.credits || null,
							}
						}
					}
				}

				return result
			}
		}
	}

	return {}
}

/**
 * Patches references in a record of Prismic field.
 *
 * @typeParam TFields - Type of the record of Prismic fields.
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @param record - The link field to patch.
 * @param assets - A map of assets available in the Prismic repository.
 * @param documents - A map of documents available in the Prismic repository.
 *
 * @returns The patched record.
 */
const patchRecord = async <
	TFields extends Record<string, AnyRegularField | GroupField | SliceZone>,
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	record: FieldsToMigrationFields<TFields>,
	assets: AssetMap,
	documents: DocumentMap<TDocuments>,
): Promise<TFields> => {
	const result: Record<string, AnyRegularField | GroupField | SliceZone> = {}

	for (const [key, field] of Object.entries(record)) {
		if (is.sliceZone(field)) {
			result[key] = await patchSliceZone(field, assets, documents)
		} else if (is.richText(field)) {
			result[key] = await patchRichText(field, assets, documents)
		} else if (is.group(field)) {
			result[key] = await patchGroup(field, assets, documents)
		} else if (is.link(field)) {
			result[key] = await patchLink(field, assets, documents)
		} else if (is.image(field)) {
			result[key] = patchImage(field, assets)
		} else {
			result[key] = field
		}
	}

	return result as TFields
}

/**
 * Patches references in a document's data.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @param data - The document data to patch.
 * @param assets - A map of assets available in the Prismic repository.
 * @param documents - A map of documents available in the Prismic repository.
 *
 * @returns The patched document data.
 */
export const patchMigrationDocumentData = async <
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	data: PrismicMigrationDocument<TDocuments>["data"],
	assets: AssetMap,
	documents: DocumentMap<TDocuments>,
): Promise<TDocuments["data"]> => {
	return patchRecord(data, assets, documents)
}
