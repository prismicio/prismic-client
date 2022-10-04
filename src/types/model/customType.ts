import { CustomTypeModelField } from "./types";

/**
 * A Prismic Custom Type model.
 *
 * @typeParam ID - API ID of the Custom Type.
 * @typeParam Definition - The Custom Type's tabs and their fields.
 */
export interface CustomTypeModel<
	ID extends string = string,
	Definition extends CustomTypeModelDefinition = CustomTypeModelDefinition,
> {
	/**
	 * The ID of the Custom Type model.
	 */
	id: ID;

	/**
	 * The human readable name of the Custom Type Model.
	 */
	// TODO: Revert to `label?: string | null` if `label` can be partial in: https://github.com/prismicio/prismic-types-internal/blob/HEAD/src/customtypes/CustomType.ts#L39
	label: string | null | undefined;

	/**
	 * Determines if more than one document for the Custom Type can be created.
	 */
	repeatable: boolean;

	/**
	 * The Custom Type model definition.
	 */
	json: Definition;

	/**
	 * Determines if new documents for the Custom Type can be created.
	 */
	status: boolean;
}

/**
 * A Prismic Custom Type's tabs and their fields.
 *
 * @typeParam TabName - Names of Custom Type tabs.
 */
export type CustomTypeModelDefinition<TabName extends string = string> = Record<
	TabName,
	CustomTypeModelTab
>;

/**
 * A Custom Type's tab. Each tab can contain any number of fields but is limited
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
