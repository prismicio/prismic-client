import type { CustomTypeModelBooleanField } from "./boolean.ts"
import type { CustomTypeModelColorField } from "./color.ts"
import type { CustomTypeModelContentRelationshipField } from "./contentRelationship.ts"
import type { CustomTypeModelDateField } from "./date.ts"
import type { CustomTypeModelEmbedField } from "./embed.ts"
import type { CustomTypeModelGeoPointField } from "./geoPoint.ts"
import type {
	CustomTypeModelGroupField,
	CustomTypeModelNestedGroupField,
} from "./group"
import type { CustomTypeModelImageField } from "./image.ts"
import type { CustomTypeModelIntegrationField } from "./integration.ts"
import type { CustomTypeModelKeyTextField } from "./keyText.ts"
import type { CustomTypeModelLinkField } from "./link.ts"
import type { CustomTypeModelLinkToMediaField } from "./linkToMedia.ts"
import type { CustomTypeModelNumberField } from "./number.ts"
import type { CustomTypeModelRangeField } from "./range.ts"
import type { CustomTypeModelRichTextField } from "./richText.ts"
import type { CustomTypeModelSelectField } from "./select.ts"
import type { CustomTypeModelSeparatorField } from "./separator.ts"
import type { CustomTypeModelSliceZoneField } from "./sliceZone.ts"
import type { CustomTypeModelTableField } from "./table.ts"
import type { CustomTypeModelTimestampField } from "./timestamp.ts"
import type { CustomTypeModelTitleField } from "./title.ts"
import type { CustomTypeModelUIDField } from "./uid.ts"

/**
 * Type identifier for a custom type field.
 */
export const CustomTypeModelFieldType = {
	Boolean: "Boolean",
	Color: "Color",
	Date: "Date",
	Embed: "Embed",
	GeoPoint: "GeoPoint",
	Group: "Group",
	Image: "Image",
	Integration: "IntegrationFields",
	Link: "Link",
	Number: "Number",
	Select: "Select",
	Slices: "Slices",
	StructuredText: "StructuredText",
	Table: "Table",
	Text: "Text",
	Timestamp: "Timestamp",
	UID: "UID",
	/**
	 * @deprecated - Renamed to `Integration`.
	 */
	IntegrationFields: "IntegrationFields",
	/**
	 * @deprecated - Legacy field type. Use `Number` instead.
	 */
	Range: "Range",
	/**
	 * @deprecated - Legacy field type. Do not use.
	 */
	Separator: "Separator",
	/**
	 * @deprecated - Legacy field type. Use `Slices` instead.
	 */
	LegacySlices: "Choice",
} as const

/**
 * A custom type field.
 */
export type CustomTypeModelField =
	| CustomTypeModelUIDField
	| CustomTypeModelGroupField
	| CustomTypeModelSliceZoneField
	| CustomTypeModelFieldForNestedGroup

/**
 * Any custom type field that is valid for a slice's primary section.
 */
export type CustomTypeModelFieldForSlicePrimary =
	| CustomTypeModelGroupField
	| CustomTypeModelFieldForNestedGroup

/**
 * Any custom type field that is valid for a group field.
 */
export type CustomTypeModelFieldForGroup =
	| CustomTypeModelNestedGroupField
	| CustomTypeModelFieldForNestedGroup

/**
 * Any custom type field that is valid for a nested group field.
 */
export type CustomTypeModelFieldForNestedGroup =
	| CustomTypeModelBooleanField
	| CustomTypeModelColorField
	| CustomTypeModelDateField
	| CustomTypeModelEmbedField
	| CustomTypeModelGeoPointField
	| CustomTypeModelImageField
	| CustomTypeModelIntegrationField
	| CustomTypeModelContentRelationshipField
	| CustomTypeModelLinkField
	| CustomTypeModelLinkToMediaField
	| CustomTypeModelNumberField
	| CustomTypeModelRangeField
	| CustomTypeModelSelectField
	| CustomTypeModelRichTextField
	| CustomTypeModelTableField
	| CustomTypeModelTitleField
	| CustomTypeModelKeyTextField
	| CustomTypeModelTimestampField
	| CustomTypeModelSeparatorField
