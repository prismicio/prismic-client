import type { CustomTypeModelFieldType } from "./types"

/**
 * A rich text custom type field.
 *
 * More details: {@link https://prismic.io/docs/rich-text-title}
 */
export type CustomTypeModelRichTextField =
	| CustomTypeModelRichTextMultiField
	| CustomTypeModelRichTextSingleField

/**
 * A rich text custom type field which supports multiple blocks of content.
 *
 * More details: {@link https://prismic.io/docs/rich-text-title}
 */
export interface CustomTypeModelRichTextMultiField {
	type: typeof CustomTypeModelFieldType.StructuredText
	config?: {
		label?: string | null
		placeholder?: string
		allowTargetBlank?: boolean
		multi?: string
		// @prismicio/types-internal types `labels` as readonly.
		labels?: readonly string[]
	}
}

/**
 * A rich text custom type field which supports one block of content.
 *
 * More details: {@link https://prismic.io/docs/rich-text-title}
 */
export interface CustomTypeModelRichTextSingleField {
	type: typeof CustomTypeModelFieldType.StructuredText
	config?: {
		label?: string | null
		placeholder?: string
		allowTargetBlank?: boolean
		single?: string
		// @prismicio/types-internal types `labels` as readonly.
		labels?: readonly string[]
	}
}
