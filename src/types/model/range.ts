import type { CustomTypeModelFieldType } from "./types.ts"

/**
 * @deprecated - Legacy field. Use `CustomTypeModelNumberField` instead.
 */
export interface CustomTypeModelRangeField {
	type: typeof CustomTypeModelFieldType.Range
	config?: {
		label?: string | null
		placeholder?: string
		min?: number
		max?: number
		step?: number
	}
}
