import type { CustomTypeModelTimestampField } from "../../types/model/timestamp"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a timestamp field.
 */
export interface TimestampFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates a timestamp field model.
 *
 * @example
 *
 * ```ts
 * model.timestamp({ label: "Event Time" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A timestamp field model.
 */
export const timestamp = (
	config?: TimestampFieldConfig,
): CustomTypeModelTimestampField => {
	return {
		type: CustomTypeModelFieldType.Timestamp,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
		},
	}
}
