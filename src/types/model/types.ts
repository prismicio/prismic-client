import type { CustomTypeModelBooleanField } from "./boolean";
import type { CustomTypeModelColorField } from "./color";
import type { CustomTypeModelContentRelationshipField } from "./contentRelationship";
import type { CustomTypeModelDateField } from "./date";
import type { CustomTypeModelEmbedField } from "./embed";
import type { CustomTypeModelGeoPointField } from "./geoPoint";
import type { CustomTypeModelGroupField } from "./group";
import type { CustomTypeModelImageField } from "./image";
import type { CustomTypeModelIntegrationFieldsField } from "./integrationFields";
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
 * Type identifier for a Custom Type field.
 */
export const CustomTypeModelFieldType = {
	Boolean: "Boolean",
	Color: "Color",
	Date: "Date",
	Embed: "Embed",
	GeoPoint: "GeoPoint",
	Group: "Group",
	Image: "Image",
	IntegrationFields: "IntegrationFields",
	Link: "Link",
	Number: "Number",
	Select: "Select",
	Slices: "Slices",
	StructuredText: "StructuredText",
	Text: "Text",
	Timestamp: "Timestamp",
	UID: "UID",
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
 * A Custom Type field.
 */
export type CustomTypeModelField =
	| CustomTypeModelUIDField
	| CustomTypeModelGroupField
	| CustomTypeModelSliceZoneField
	| CustomTypeModelFieldForGroup;

/**
 * Any Custom Type field that is valid for a Group field.
 */
export type CustomTypeModelFieldForGroup =
	| CustomTypeModelBooleanField
	| CustomTypeModelColorField
	| CustomTypeModelDateField
	| CustomTypeModelEmbedField
	| CustomTypeModelGeoPointField
	| CustomTypeModelImageField
	| CustomTypeModelIntegrationFieldsField
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
