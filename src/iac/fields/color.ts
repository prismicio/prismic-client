import type { CustomTypeModelColorField } from "../../types/model/color"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a color field.
 */
export interface ColorFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates a color field model.
 *
 * @example
 *
 * ```ts
 * model.color({ label: "Background Color" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A color field model.
 */
export const color = (config?: ColorFieldConfig): CustomTypeModelColorField => {
	return {
		type: CustomTypeModelFieldType.Color,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
		},
	}
}
