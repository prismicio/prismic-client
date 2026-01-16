import type { CustomTypeModelKeyTextField } from "../../types/model/keyText"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a text field.
 */
export interface TextFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates a text field model (key text).
 *
 * @example
 *
 * ```ts
 * model.text({ label: "Title" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A text field model.
 */
export const text = (config?: TextFieldConfig): CustomTypeModelKeyTextField => {
	return {
		type: CustomTypeModelFieldType.Text,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
		},
	}
}
