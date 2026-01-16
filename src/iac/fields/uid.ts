import type { CustomTypeModelUIDField } from "../../types/model/uid"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a UID field.
 */
export interface UIDFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates a UID field model.
 *
 * @example
 *
 * ```ts
 * model.uid({ label: "UID" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A UID field model.
 */
export const uid = (config?: UIDFieldConfig): CustomTypeModelUIDField => {
	return {
		type: CustomTypeModelFieldType.UID,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
		},
	}
}
