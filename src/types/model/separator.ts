import type { CustomTypeModelFieldType } from "./types.ts"

/**
 * @deprecated - Legacy field. Do not use.
 */
export interface CustomTypeModelSeparatorField {
	type: typeof CustomTypeModelFieldType.Separator
	config?: {
		label?: string | null
	}
}
