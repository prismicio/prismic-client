import type {
	FieldToMigrationField,
	GroupFieldToMigrationField,
	RichTextFieldToMigrationField,
	SliceZoneToMigrationField,
} from "../types/migration/document"
import type {
	MigrationImageField,
	MigrationLinkField,
} from "../types/migration/fields"
import { MigrationFieldType } from "../types/migration/fields"
import type { GroupField } from "../types/value/group"
import type { ImageField } from "../types/value/image"
import type { LinkField } from "../types/value/link"
import { LinkType } from "../types/value/link"
import type { RichTextField } from "../types/value/richText"
import type { SliceZone } from "../types/value/sliceZone"
import type { AnyRegularField } from "../types/value/types"

import * as isFilled from "../helpers/isFilled"

/**
 * Check if a field is a slice zone.
 *
 * @remarks
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
export const sliceZone = (
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
export const richText = (
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
export const group = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is GroupFieldToMigrationField<GroupField> => {
	return !sliceZone(field) && !richText(field) && Array.isArray(field)
}

/**
 * Check if a field is a link field.
 *
 * @remarks
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
export const link = (
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
export const image = (
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
