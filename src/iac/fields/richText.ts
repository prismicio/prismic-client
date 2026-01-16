import type {
	CustomTypeModelRichTextField,
	CustomTypeModelRichTextMultiField,
	CustomTypeModelRichTextSingleField,
} from "../../types/model/richText"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a rich text field.
 *
 * Use `single` for title-style fields (single block).
 * Use `multi` for multi-block rich text content.
 */
export interface RichTextFieldConfig {
	label?: string | null
	placeholder?: string
	allowTargetBlank?: boolean
	/**
	 * Allowed block types for single-block mode (title-style).
	 *
	 * @example "heading1"
	 * @example "heading1,heading2,heading3"
	 */
	single?: string
	/**
	 * Allowed block types for multi-block mode.
	 *
	 * @example "paragraph,strong,em,hyperlink"
	 * @example "paragraph,heading1,heading2,strong,em,hyperlink,list-item,o-list-item"
	 */
	multi?: string
	/**
	 * Custom labels for text styling.
	 */
	labels?: readonly string[]
}

/**
 * Creates a rich text field model.
 *
 * Use the `single` config option for title-style fields (single block).
 * Use the `multi` config option for multi-block rich text content.
 *
 * @example
 *
 * ```ts
 * // Multi-block rich text (default)
 * model.richText({ label: "Description", multi: "paragraph,strong,em" })
 *
 * // Single-block title-style
 * model.richText({ label: "Heading", single: "heading1" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A rich text field model.
 */
export const richText = (
	config?: RichTextFieldConfig,
): CustomTypeModelRichTextField => {
	if (config?.single !== undefined) {
		return {
			type: CustomTypeModelFieldType.StructuredText,
			config: {
				label: config?.label ?? null,
				placeholder: config?.placeholder,
				allowTargetBlank: config?.allowTargetBlank,
				single: config.single,
				labels: config?.labels,
			},
		} satisfies CustomTypeModelRichTextSingleField
	}

	return {
		type: CustomTypeModelFieldType.StructuredText,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
			allowTargetBlank: config?.allowTargetBlank,
			multi: config?.multi,
			labels: config?.labels,
		},
	} satisfies CustomTypeModelRichTextMultiField
}
