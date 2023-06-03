import { CustomTypeModelField } from "./types";

/**
 * A Prismic custom type model.
 *
 * @typeParam ID - API ID of the custom type.
 * @typeParam Definition - The custom type's tabs and their fields.
 */
export interface CustomTypeModel<
	ID extends string = string,
	Definition extends CustomTypeModelDefinition = CustomTypeModelDefinition,
> {
	/**
	 * The ID of the custom type model.
	 */
	id: ID;

	/**
	 * The human readable name of the custom type model.
	 */
	// TODO: Revert to `label?: string | null` if `label` can be partial in: https://github.com/prismicio/prismic-types-internal/blob/HEAD/src/customtypes/CustomType.ts#L39
	label: string | null | undefined;

	/**
	 * The format of the custom type model.
	 *
	 * Fallback to "custom" if undefined.
	 */
	format?: "page" | "custom";

	/**
	 * Determines if more than one document for the custom type can be created.
	 */
	repeatable: boolean;

	/**
	 * The custom type model definition.
	 */
	json: Definition;

	/**
	 * Determines if new documents for the custom type can be created.
	 */
	status: boolean;
}

/**
 * A Prismic custom type's tabs and their fields.
 *
 * @typeParam TabName - Names of custom type tabs.
 */
export type CustomTypeModelDefinition<TabName extends string = string> = Record<
	TabName,
	CustomTypeModelTab
>;

/**
 * A custom type's tab. Each tab can contain any number of fields but is limited
 * to one Slice Zone.
 *
 * @typeParam FieldName - API IDs of the fields.
 */
export type CustomTypeModelTab<
	Fields extends Record<string, CustomTypeModelField> = Record<
		string,
		CustomTypeModelField
	>,
> = Fields;
