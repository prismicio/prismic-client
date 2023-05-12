import type { CustomTypeModelBooleanField } from "./boolean";
import type { CustomTypeModelColorField } from "./color";
import type { CustomTypeModelContentRelationshipField } from "./contentRelationship";
import type { CustomTypeModelDateField } from "./date";
import type { CustomTypeModelEmbedField } from "./embed";
import type { CustomTypeModelGeoPointField } from "./geoPoint";
import type { CustomTypeModelGroupField } from "./group";
import type { CustomTypeModelImageField } from "./image";
import type { CustomTypeModelIntegrationField } from "./integration";
import type { CustomTypeModelKeyTextField } from "./keyText";
import type { CustomTypeModelLinkField } from "./link";
import type { CustomTypeModelLinkToMediaField } from "./linkToMedia";
import type { CustomTypeModelNumberField } from "./number";
import type { CustomTypeModelRangeField } from "./range";
import type { CustomTypeModelRichTextField } from "./richText";
import type { CustomTypeModelSelectField } from "./select";
import type { CustomTypeModelSeparatorField } from "./separator";
import type { CustomTypeModelSliceZoneField } from "./sliceZone";
import type { CustomTypeModelTimestampField } from "./timestamp";
import type { CustomTypeModelTitleField } from "./title";
import type { CustomTypeModelUIDField } from "./uid";

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
} as const;

/**
 * A custom type field.
 */
export type CustomTypeModelField =
	| CustomTypeModelUIDField
	| CustomTypeModelGroupField
	| CustomTypeModelSliceZoneField
	| CustomTypeModelFieldForGroup;

/**
 * Any custom type field that is valid for a group field.
 */
export type CustomTypeModelFieldForGroup =
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
	| CustomTypeModelTitleField
	| CustomTypeModelKeyTextField
	| CustomTypeModelTimestampField
	| CustomTypeModelSeparatorField;
