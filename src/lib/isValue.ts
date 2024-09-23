import type { InjectMigrationSpecificTypes } from "../types/migration/Document"
import type { FilledContentRelationshipField } from "../types/value/contentRelationship"
import type { PrismicDocument } from "../types/value/document"
import type { GroupField } from "../types/value/group"
import type { ImageField } from "../types/value/image"
import { LinkType } from "../types/value/link"
import type { FilledLinkToMediaField } from "../types/value/linkToMedia"
import { type RTImageNode, RichTextNodeType } from "../types/value/richText"
import type { SliceZone } from "../types/value/sliceZone"
import type { AnyRegularField } from "../types/value/types"

/**
 * Unknown value to check if it's a specific field type.
 *
 * @remarks
 * Explicit types are added to help ensure narrowing is done effectively.
 */
type UnknownValue =
	| PrismicDocument
	| InjectMigrationSpecificTypes<AnyRegularField | GroupField | SliceZone>
	| unknown

/**
 * Checks if a value is a link to media field.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a link to media field, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const filledLinkToMedia = (
	value: UnknownValue,
): value is FilledLinkToMediaField => {
	if (value && typeof value === "object" && !("version" in value)) {
		if (
			"link_type" in value &&
			value.link_type === LinkType.Media &&
			"id" in value &&
			"name" in value &&
			"kind" in value &&
			"url" in value &&
			"size" in value
		) {
			value

			return true
		}
	}

	return false
}

/**
 * Checks if a value is like an image field.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is like an image field, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
const imageLike = (
	value: UnknownValue,
): value is ImageField<string, "filled"> | RTImageNode => {
	if (
		value &&
		typeof value === "object" &&
		(!("version" in value) || typeof value.version === "object")
	) {
		if (
			"id" in value &&
			"url" in value &&
			typeof value.url === "string" &&
			"dimensions" in value &&
			"edit" in value &&
			"alt" in value &&
			"copyright" in value
		) {
			return true
		}
	}

	return false
}

/**
 * Checks if a value is an image field.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is an image field, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const filledImage = (
	value: UnknownValue,
): value is ImageField<string, "filled"> => {
	if (
		imageLike(value) &&
		(!("type" in value) || value.type !== RichTextNodeType.image)
	) {
		value

		return true
	}

	return false
}

/**
 * Checks if a value is a rich text image node.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a rich text image node, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const rtImageNode = (value: UnknownValue): value is RTImageNode => {
	if (
		imageLike(value) &&
		"type" in value &&
		value.type === RichTextNodeType.image
	) {
		value

		return true
	}

	return false
}

/**
 * Checks if a value is a content relationship field.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a content relationship, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const filledContentRelationship = (
	value: UnknownValue,
): value is FilledContentRelationshipField => {
	if (value && typeof value === "object" && !("version" in value)) {
		if (
			"link_type" in value &&
			value.link_type === LinkType.Document &&
			"id" in value &&
			"type" in value &&
			"tags" in value &&
			"lang" in value
		) {
			return true
		}
	}

	return false
}

/**
 * Checks if a value is a Prismic document.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a Prismic document, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const prismicDocument = (
	value: UnknownValue,
): value is PrismicDocument => {
	try {
		return (
			typeof value === "object" &&
			value !== null &&
			"id" in value &&
			"href" in value &&
			typeof value.href === "string" &&
			new URL(value.href) &&
			"type" in value &&
			"lang" in value &&
			"tags" in value &&
			Array.isArray(value.tags)
		)
	} catch {
		return false
	}
}
