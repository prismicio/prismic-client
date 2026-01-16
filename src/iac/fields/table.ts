import type { CustomTypeModelTableField } from "../../types/model/table"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a table field.
 */
export interface TableFieldConfig {
	label?: string | null
}

/**
 * Creates a table field model.
 *
 * @example
 *
 * ```ts
 * model.table({ label: "Data Table" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A table field model.
 */
export const table = (config?: TableFieldConfig): CustomTypeModelTableField => {
	return {
		type: CustomTypeModelFieldType.Table,
		config: {
			label: config?.label ?? null,
		},
	}
}
