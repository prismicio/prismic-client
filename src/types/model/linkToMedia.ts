import type { CustomTypeModelLinkSelectType } from "./link.ts"
import type { CustomTypeModelFieldType } from "./types.ts"

/**
 * A link to media custom type field.
 *
 * More details: {@link https://prismic.io/docs/media}
 */
export interface CustomTypeModelLinkToMediaField {
	type: typeof CustomTypeModelFieldType.Link
	config?: {
		label?: string | null
		placeholder?: string
		select: typeof CustomTypeModelLinkSelectType.Media
		allowText?: boolean
		variants?: string[]
	}
}
