import type { CustomTypeModelGroupField } from "../../types/model/group"
import type { CustomTypeModelFieldForGroup } from "../../types/model/types"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a group field.
 */
export interface GroupFieldConfig<
	Fields extends Record<string, CustomTypeModelFieldForGroup> = Record<
		string,
		CustomTypeModelFieldForGroup
	>,
> {
	label?: string | null
	/**
	 * Fields within the group.
	 */
	fields?: Fields
}

/**
 * Creates a group field model.
 *
 * @example
 *
 * ```ts
 * model.group({
 *   label: "Items",
 *   fields: {
 *     title: model.text({ label: "Title" }),
 *     image: model.image({ label: "Image" }),
 *     link: model.link({ label: "Link" })
 *   }
 * })
 * ```
 *
 * @typeParam Fields - Field definitions for type inference.
 *
 * @param config - Configuration for the field.
 *
 * @returns A group field model.
 */
export const group = <
	Fields extends Record<string, CustomTypeModelFieldForGroup> = Record<
		string,
		CustomTypeModelFieldForGroup
	>,
>(
	config?: GroupFieldConfig<Fields>,
): CustomTypeModelGroupField<Fields> => {
	return {
		type: CustomTypeModelFieldType.Group,
		config: {
			label: config?.label ?? null,
			fields: config?.fields,
		},
	}
}
