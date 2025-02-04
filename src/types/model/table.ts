import type { CustomTypeModelFieldType } from "./types"

/**
 * A table custom type field.
 *
 * More details: {@link https://prismic.io/docs/table}
 */
export interface CustomTypeModelTableField {
	type: typeof CustomTypeModelFieldType.Table
	config?: {
		label?: string | null
	}
}
