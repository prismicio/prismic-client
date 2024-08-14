import type { CustomTypeModelFieldType } from "./types"

import type { CustomTypeModelKeyTextField } from "./keyText"

/**
 * A link custom type field.
 *
 * More details: {@link https://prismic.io/docs/link}
 */
export interface CustomTypeModelLinkField {
	type: typeof CustomTypeModelFieldType.Link
	config?: {
		label?: string | null
		placeholder?: string
		select?:
			| null
			| (typeof CustomTypeModelLinkSelectType)[keyof typeof CustomTypeModelLinkSelectType]
		text?: CustomTypeModelKeyTextField
		allowTargetBlank?: boolean
	}
}

/**
 * Type of a link custom type field.
 *
 * More details: {@link https://prismic.io/docs/link}
 */
export const CustomTypeModelLinkSelectType = {
	Document: "document",
	Media: "media",
	Web: "web",
} as const
