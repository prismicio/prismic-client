import type {
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "../types/migration/Asset"
import { PrismicMigrationAsset } from "../types/migration/Asset"
import type { MigrationContentRelationship } from "../types/migration/ContentRelationship"
import {
	type InjectMigrationSpecificTypes,
	PrismicMigrationDocument,
} from "../types/migration/Document"
import type { PrismicDocument } from "../types/value/document"
import type { GroupField } from "../types/value/group"
import { LinkType } from "../types/value/link"
import { RichTextNodeType } from "../types/value/richText"
import type { SliceZone } from "../types/value/sliceZone"
import type { AnyRegularField } from "../types/value/types"

import * as is from "./isValue"

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
 * Checks if a value is a migration content relationship field.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a migration content relationship field, `false`
 *   otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const contentRelationship = (
	value: UnknownValue,
): value is MigrationContentRelationship => {
	return (
		value instanceof PrismicMigrationDocument ||
		is.prismicDocument(value) ||
		(typeof value === "object" &&
			value !== null &&
			"link_type" in value &&
			value.link_type === LinkType.Document &&
			"id" in value &&
			(contentRelationship(value.id) || typeof value.id === "function"))
	)
}

/**
 * Checks if a value is a migration image field.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a migration image field, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const image = (value: UnknownValue): value is MigrationImage => {
	return (
		value instanceof PrismicMigrationAsset ||
		(typeof value === "object" &&
			value !== null &&
			"id" in value &&
			Object.values(value).every(
				(maybeThumbnail) => maybeThumbnail instanceof PrismicMigrationAsset,
			))
	)
}

/**
 * Checks if a value is a migration link to media field.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a migration link to media field, `false`
 *   otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const linkToMedia = (
	value: UnknownValue,
): value is MigrationLinkToMedia => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		value.id instanceof PrismicMigrationAsset &&
		"link_type" in value &&
		value.link_type === LinkType.Media
	)
}

/**
 * Checks if a value is a migration rich text image node.
 *
 * @param value - Value to check.
 *
 * @returns `true` if `value` is a migration rich text image node, `false`
 *   otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work with internal processes.
 */
export const rtImageNode = (
	value: UnknownValue,
): value is MigrationRTImageNode => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		value.id instanceof PrismicMigrationAsset &&
		"type" in value &&
		value.type === RichTextNodeType.image
	)
}
