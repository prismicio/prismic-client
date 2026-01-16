import type { CustomTypeModelNumberField } from "../../types/model/number"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a number field.
 */
export interface NumberFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates a number field model.
 *
 * @example
 *
 * ```ts
 * model.number({ label: "Price" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A number field model.
 */
export const number = (
	config?: NumberFieldConfig,
): CustomTypeModelNumberField => {
	return {
		type: CustomTypeModelFieldType.Number,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
		},
	}
}
