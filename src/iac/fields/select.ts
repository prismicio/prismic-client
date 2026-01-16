import type { CustomTypeModelSelectField } from "../../types/model/select"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a select field.
 */
export interface SelectFieldConfig<
	Option extends string,
	DefaultValue extends Option = Option,
> {
	label?: string | null
	placeholder?: string
	/**
	 * Default selected option.
	 */
	default_value?: DefaultValue
}

/**
 * Creates a select field model.
 *
 * Options are passed as the first argument for better type inference.
 *
 * @example
 *
 * ```ts
 * // Basic select
 * model.select(["draft", "published", "archived"] as const, {
 *   label: "Status"
 * })
 *
 * // With default value (type-safe)
 * model.select(["small", "medium", "large"] as const, {
 *   label: "Size",
 *   default_value: "medium"
 * })
 * ```
 *
 * @typeParam Option - Option value literals for type inference.
 * @typeParam DefaultValue - Default value literal for type inference.
 *
 * @param options - Array of select options.
 * @param config - Configuration for the field.
 *
 * @returns A select field model.
 */
export const select = <
	Option extends string,
	DefaultValue extends Option = Option,
>(
	options: readonly Option[],
	config?: SelectFieldConfig<Option, DefaultValue>,
): CustomTypeModelSelectField<Option, DefaultValue> => {
	return {
		type: CustomTypeModelFieldType.Select,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
			options,
			default_value: config?.default_value,
		},
	}
}
