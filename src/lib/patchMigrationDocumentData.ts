import type { Asset } from "../types/api/asset/asset"
import type { MigrationAsset } from "../types/migration/asset"
import type {
	FieldToMigrationField,
	FieldsToMigrationFields,
	GroupFieldToMigrationField,
	MigrationPrismicDocument,
	RichTextFieldToMigrationField,
	SliceZoneToMigrationField,
} from "../types/migration/document"
import type {
	MigrationImageField,
	MigrationLinkField,
} from "../types/migration/fields"
import { MigrationFieldType } from "../types/migration/fields"
import type { FilledContentRelationshipField } from "../types/value/contentRelationship"
import type { PrismicDocument } from "../types/value/document"
import type { GroupField, NestedGroupField } from "../types/value/group"
import type { FilledImageFieldImage, ImageField } from "../types/value/image"
import { LinkType } from "../types/value/link"
import type { LinkField } from "../types/value/link"
import type { LinkToMediaField } from "../types/value/linkToMedia"
import type { RTImageNode, RTInlineNode } from "../types/value/richText"
import { type RichTextField, RichTextNodeType } from "../types/value/richText"
import type { SharedSlice } from "../types/value/sharedSlice"
import type { Slice } from "../types/value/slice"
import type { SliceZone } from "../types/value/sliceZone"
import type { AnyRegularField } from "../types/value/types"

import * as isFilled from "../helpers/isFilled"

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
 * @internal
 */
export type DocumentMap<TDocuments extends PrismicDocument = PrismicDocument> =
	Map<
		| string
		| TDocuments
		| MigrationPrismicDocument
		| MigrationPrismicDocument<TDocuments>,
		| PrismicDocument
		| (Omit<MigrationPrismicDocument<PrismicDocument>, "id"> & { id: string })
	>

/**
 * Convert an asset to an image field.
 */
const assetToImageField = ({
	id,
	url,
	width,
	height,
	alt,
	credits,
}: Asset): ImageField<never, "filled"> => {
	return {
		id,
		url,
		dimensions: { width: width!, height: height! },
		edit: { x: 0, y: 0, zoom: 0, background: "transparent" },
		alt: alt || null,
		copyright: credits || null,
	}
}

/**
 * Convert an asset to a link to media field.
 */
const assetToLinkToMediaField = ({
	id,
	filename,
	kind,
	url,
	size,
	width,
	height,
}: Asset): LinkToMediaField<"filled"> => {
	return {
		id,
		link_type: LinkType.Media,
		name: filename,
		kind,
		url,
		size: `${size}`,
		width: width ? `${width}` : undefined,
		height: height ? `${height}` : undefined,
	}
}

/**
 * Convert an asset to an RT image node.
 */
const assetToRTImageNode = (asset: Asset): RTImageNode => {
	return {
		...assetToImageField(asset),
		type: RichTextNodeType.image,
	}
}

/**
 * Convert a document to a content relationship field.
 */
const documentToContentRelationship = <
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	document:
		| TDocuments
		| (Omit<MigrationPrismicDocument, "id"> & { id: string }),
): FilledContentRelationshipField => {
	return {
		link_type: LinkType.Document,
		id: document.id,
		uid: document.uid ?? undefined,
		type: document.type,
		tags: document.tags ?? [],
		lang: document.lang,
		url: undefined,
		slug: undefined,
		isBroken: false,
		data: undefined,
	}
}

/**
 * Inherit query parameters from an original URL to a new URL.
 */
const inheritQueryParams = (url: string, original: string): string => {
	const queryParams = original.split("?")[1] || ""

	return `${url.split("?")[0]}${queryParams ? `?${queryParams}` : ""}`
}

/**
 * Check if a field is a slice zone.
 *
 * @remarks
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
const isSliceZone = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is SliceZoneToMigrationField<SliceZone> => {
	return (
		Array.isArray(field) &&
		field.every((item) => "slice_type" in item && "id" in item)
	)
}

/**
 * Check if a field is a rich text field.
 *
 * @remarks
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
const isRichText = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is RichTextFieldToMigrationField<RichTextField> => {
	return (
		Array.isArray(field) &&
		field.every(
			(item) =>
				("type" in item && typeof item.type === "string") ||
				("migrationType" in item &&
					item.migrationType === MigrationFieldType.Image),
		)
	)
}

/**
 * Check if a field is a group field.
 *
 * @remarks
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
const isGroup = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is GroupFieldToMigrationField<GroupField> => {
	return !isSliceZone(field) && !isRichText(field) && Array.isArray(field)
}

/**
 * Check if a field is a link field.
 *
 * @remarks
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
const isLink = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is MigrationLinkField | LinkField => {
	if (typeof field === "function") {
		// Lazy content relationship field
		return true
	} else if (field && typeof field === "object" && !("version" in field)) {
		if (
			"migrationType" in field &&
			field.migrationType === MigrationFieldType.LinkToMedia
		) {
			// Migration link to media field
			return true
		} else if (
			"type" in field &&
			"lang" in field &&
			typeof field.lang === "string" &&
			field.id
		) {
			// Content relationship field declared using another repository document
			return true
		} else if (
			"link_type" in field &&
			(field.link_type === LinkType.Document ||
				field.link_type === LinkType.Media ||
				field.link_type === LinkType.Web)
		) {
			// Regular link field
			return true
		}
	}

	return false
}

/**
 * Check if a field is an image field.
 *
 * @remarks
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
const isImage = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is MigrationImageField | ImageField => {
	if (field && typeof field === "object" && !("version" in field)) {
		if (
			"migrationType" in field &&
			field.migrationType === MigrationFieldType.Image
		) {
			// Migration image field
			return true
		} else if (
			"id" in field &&
			"dimensions" in field &&
			field.dimensions &&
			isFilled.image(field)
		) {
			// Regular image field
			return true
		}
	}

	return false
}

/**
 * Patch a slice zone.
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
 * Patch a rich text field.
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
					...assetToRTImageNode(asset),
					linkTo: isFilled.link(linkTo) ? linkTo : undefined,
				})
			}
		}
	}

	return result
}

/**
 * Patch a group field.
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
 * Patch a link field.
 */
const patchLink = async <TDocuments extends PrismicDocument = PrismicDocument>(
	link: MigrationLinkField | LinkField,
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
					return documentToContentRelationship(maybeRelationship)
				}
			}
		} else if ("migrationType" in link) {
			// Migration link field
			const asset = assets.get(link.id)
			if (asset) {
				return assetToLinkToMediaField(asset)
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
				return documentToContentRelationship(maybeRelationship)
			}
		}
	}

	return {
		link_type: LinkType.Any,
	}
}

/**
 * Patch an image field.
 */
const patchImage = (
	image: MigrationImageField | ImageField,
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
				return assetToImageField(asset)
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

				return result
			}
		}
	}

	return {}
}

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
		if (isSliceZone(field)) {
			result[key] = await patchSliceZone(field, assets, documents)
		} else if (isRichText(field)) {
			result[key] = await patchRichText(field, assets, documents)
		} else if (isGroup(field)) {
			result[key] = await patchGroup(field, assets, documents)
		} else if (isLink(field)) {
			result[key] = await patchLink(field, assets, documents)
		} else if (isImage(field)) {
			result[key] = patchImage(field, assets)
		} else {
			result[key] = field
		}
	}

	return result as TFields
}

export const patchMigrationDocumentData = async <
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	data: MigrationPrismicDocument<TDocuments>["data"],
	assets: AssetMap,
	documents: DocumentMap<TDocuments>,
): Promise<TDocuments["data"]> => {
	return patchRecord(data, assets, documents)
}
