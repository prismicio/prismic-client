import type { Asset } from "../types/api/asset/asset"
import type { PrismicMigrationDocument } from "../types/migration/document"
import type { FilledContentRelationshipField } from "../types/value/contentRelationship"
import type { PrismicDocument } from "../types/value/document"
import type { ImageField } from "../types/value/image"
import { LinkType } from "../types/value/link"
import type { LinkToMediaField } from "../types/value/linkToMedia"
import type { RTImageNode } from "../types/value/richText"
import { RichTextNodeType } from "../types/value/richText"

/**
 * Converts an asset to an image field.
 *
 * @param asset - Asset to convert.
 *
 * @returns Equivalent image field.
 */
export const imageField = ({
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
 * Converts an asset to a link to media field.
 *
 * @param asset - Asset to convert.
 *
 * @returns Equivalent link to media field.
 */
export const linkToMediaField = ({
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
 * Converts an asset to an RT image node.
 *
 * @param asset - Asset to convert.
 *
 * @returns Equivalent rich text image node.
 */
export const rtImageNode = (asset: Asset): RTImageNode => {
	return {
		...imageField(asset),
		type: RichTextNodeType.image,
	}
}

/**
 * Converts a document to a content relationship field.
 *
 * @typeParam TDocuments - Type of Prismic documents in the repository.
 *
 * @param document - Document to convert.
 *
 * @returns Equivalent content relationship.
 */
export const contentRelationship = <
	TDocuments extends PrismicDocument = PrismicDocument,
>(
	document:
		| TDocuments
		| (Omit<PrismicMigrationDocument, "id"> & { id: string }),
): FilledContentRelationshipField => {
	return {
		link_type: LinkType.Document,
		id: document.id,
		uid: document.uid || undefined,
		type: document.type,
		tags: document.tags || [],
		lang: document.lang,
		url: undefined,
		slug: undefined,
		isBroken: false,
		data: undefined,
	}
}
