import type { CustomTypeModelDateField } from "../../types/model/date"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a date field.
 */
export interface DateFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates a date field model.
 *
 * @example
 *
 * ```ts
 * model.date({ label: "Publication Date" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A date field model.
 */
export const date = (config?: DateFieldConfig): CustomTypeModelDateField => {
	return {
		type: CustomTypeModelFieldType.Date,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
		},
	}
}
