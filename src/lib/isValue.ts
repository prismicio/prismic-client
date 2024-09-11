import type {
	FieldWithMigrationField,
	RichTextBlockNodeWithMigrationField,
} from "../types/migration/Document"
import type { FilledContentRelationshipField } from "../types/value/contentRelationship"
import type { PrismicDocument } from "../types/value/document"
import type { ImageField } from "../types/value/image"
import { LinkType } from "../types/value/link"
import type { FilledLinkToMediaField } from "../types/value/linkToMedia"
import { type RTImageNode, RichTextNodeType } from "../types/value/richText"

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
export const linkToMedia = (
	value:
		| PrismicDocument
		| FieldWithMigrationField
		| RichTextBlockNodeWithMigrationField
		| unknown,
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
	value:
		| PrismicDocument
		| FieldWithMigrationField
		| RichTextBlockNodeWithMigrationField
		| unknown,
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
export const image = (
	value:
		| PrismicDocument
		| FieldWithMigrationField
		| RichTextBlockNodeWithMigrationField
		| unknown,
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
export const rtImageNode = (
	value:
		| PrismicDocument
		| FieldWithMigrationField
		| RichTextBlockNodeWithMigrationField
		| unknown,
): value is RTImageNode => {
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
export const contentRelationship = (
	value:
		| PrismicDocument
		| FieldWithMigrationField
		| RichTextBlockNodeWithMigrationField
		| unknown,
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
 * @returns `true` if `value` is a content relationship, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const document = (
	value:
		| PrismicDocument
		| FieldWithMigrationField
		| RichTextBlockNodeWithMigrationField
		| unknown,
): value is PrismicDocument => {
	if (value && typeof value === "object" && !("version" in value)) {
		if (
			"id" in value &&
			"uid" in value &&
			"url" in value &&
			"type" in value &&
			typeof value.type === "string" &&
			"href" in value &&
			"tags" in value &&
			"first_publication_date" in value &&
			"last_publication_date" in value &&
			"slugs" in value &&
			"linked_documents" in value &&
			"lang" in value &&
			"alternate_languages" in value &&
			"data" in value
		) {
			return true
		}
	}

	return false
}
