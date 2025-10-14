import type { CustomTypeModelFieldType } from "./types.ts"

/**
 * A date custom type field.
 *
 * More details: {@link https://prismic.io/docs/date}
 */
export interface CustomTypeModelDateField {
	type: typeof CustomTypeModelFieldType.Date
	config?: {
		label?: string | null
		placeholder?: string
		default?: string
	}
}
