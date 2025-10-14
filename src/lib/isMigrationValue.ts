import type {
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "../types/migration/Asset"
import { PrismicMigrationAsset } from "../types/migration/Asset.ts"
import type { MigrationContentRelationship } from "../types/migration/ContentRelationship.ts"
import {
	type InjectMigrationSpecificTypes,
	PrismicMigrationDocument,
} from "../types/migration/Document.ts"
import type { PrismicDocument } from "../types/value/document.ts"
import type { GroupField } from "../types/value/group.ts"
import { LinkType } from "../types/value/link.ts"
import type { OptionalLinkProperties } from "../types/value/link.ts"
import { RichTextNodeType } from "../types/value/richText.ts"
import type { SliceZone } from "../types/value/sliceZone.ts"
import type { AnyRegularField } from "../types/value/types.ts"

import * as is from "./isValue.ts"

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
 * @remarks
 * `OptionalLinkProperties` is included because `MigrationContentRelationship`
 * may be a link field, not strictly a content relationship field.
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
): value is MigrationContentRelationship & OptionalLinkProperties => {
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
 * - @remarks `OptionalLinkProperties` is included because
 *   `MigrationContentRelationship` may be a link field, not strictly a content
 *   relationship field.
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
): value is MigrationLinkToMedia & OptionalLinkProperties => {
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
