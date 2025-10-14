import type { CustomTypeModelFieldType } from "./types.ts"

/**
 * An embed custom type field.
 *
 * More details: {@link https://prismic.io/docs/embed}
 */
export interface CustomTypeModelEmbedField {
	type: typeof CustomTypeModelFieldType.Embed
	config?: {
		label?: string | null
		placeholder?: string
	}
}
