import type { CustomTypeModelBooleanField } from "../../types/model/boolean"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a boolean field.
 */
export interface BooleanFieldConfig {
	label?: string | null
	/**
	 * Default value for the boolean field.
	 */
	default_value?: boolean
	/**
	 * Placeholder text shown when the value is true.
	 */
	placeholder_true?: string
	/**
	 * Placeholder text shown when the value is false.
	 */
	placeholder_false?: string
}

/**
 * Creates a boolean field model.
 *
 * @example
 *
 * ```ts
 * model.boolean({ label: "Featured" })
 *
 * model.boolean({
 *   label: "Published",
 *   default_value: false,
 *   placeholder_true: "Published",
 *   placeholder_false: "Draft"
 * })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A boolean field model.
 */
export const boolean = (
	config?: BooleanFieldConfig,
): CustomTypeModelBooleanField => {
	return {
		type: CustomTypeModelFieldType.Boolean,
		config: {
			label: config?.label ?? null,
			default_value: config?.default_value,
			placeholder_true: config?.placeholder_true,
			placeholder_false: config?.placeholder_false,
		},
	}
}
