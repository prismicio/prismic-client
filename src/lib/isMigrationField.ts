import type {
	FieldToMigrationField,
	GroupFieldToMigrationField,
	RichTextFieldToMigrationField,
	SliceZoneToMigrationField,
} from "../types/migration/document"
import type {
	ImageMigrationField,
	LinkMigrationField,
} from "../types/migration/fields"
import { MigrationFieldType } from "../types/migration/fields"
import type { GroupField } from "../types/value/group"
import type { ImageField } from "../types/value/image"
import type { LinkField } from "../types/value/link"
import { LinkType } from "../types/value/link"
import type { RichTextField } from "../types/value/richText"
import type { SliceZone } from "../types/value/sliceZone"
import type { AnyRegularField } from "../types/value/types"

/**
 * Checks if a field is a slice zone.
 *
 * @param field - Field to check.
 *
 * @returns `true` if `field` is a slice zone migration field, `false`
 *   otherwise.
 *
 * @internal
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
 * Checks if a field is a rich text field.
 *
 * @param field - Field to check.
 *
 * @returns `true` if `field` is a rich text migration field, `false` otherwise.
 *
 * @internal
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
 * Checks if a field is a group field.
 *
 * @param field - Field to check.
 *
 * @returns `true` if `field` is a group migration field, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
export const group = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is GroupFieldToMigrationField<GroupField> => {
	return !sliceZone(field) && !richText(field) && Array.isArray(field)
}

/**
 * Checks if a field is a link field.
 *
 * @param field - Field to check.
 *
 * @returns `true` if `field` is a link migration field, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
export const link = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is LinkMigrationField | LinkField => {
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
 * Checks if a field is an image field.
 *
 * @param field - Field to check.
 *
 * @returns `true` if `field` is an image migration field, `false` otherwise.
 *
 * @internal
 * This is not an official helper function and it's only designed to work in the
 * case of migration fields.
 */
export const image = (
	field: FieldToMigrationField<AnyRegularField | GroupField | SliceZone>,
): field is ImageMigrationField | ImageField => {
	if (field && typeof field === "object" && !("version" in field)) {
		if (
			"migrationType" in field &&
			field.migrationType === MigrationFieldType.Image
		) {
			// Migration image field
			return true
		} else if ("id" in field && "url" in field && "dimensions" in field) {
			// Regular image field
			return true
		}
	}

	return false
}
