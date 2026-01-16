import type {
	CustomTypeModelLinkField,
	CustomTypeModelLinkSelectType,
} from "../../types/model/link"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a link field.
 */
export interface LinkFieldConfig {
	label?: string | null
	placeholder?: string
	/**
	 * Restrict the link type.
	 *
	 * - `"document"` - Only allow content relationship links.
	 * - `"media"` - Only allow media links.
	 * - `"web"` - Only allow web links.
	 * - `null` or `undefined` - Allow all link types.
	 */
	select?:
		| (typeof CustomTypeModelLinkSelectType)[keyof typeof CustomTypeModelLinkSelectType]
		| null
	/**
	 * Allow custom link text.
	 */
	allowText?: boolean
	/**
	 * Allow opening links in a new tab.
	 */
	allowTargetBlank?: boolean
	/**
	 * Allow multiple links (repeatable).
	 */
	repeat?: boolean
	/**
	 * Link variants.
	 */
	variants?: string[]
}

/**
 * Creates a link field model.
 *
 * @example
 *
 * ```ts
 * // Any link type
 * model.link({ label: "CTA Link" })
 *
 * // Web links only
 * model.link({ label: "External Link", select: "web" })
 *
 * // With custom text and target blank
 * model.link({
 *   label: "Button Link",
 *   allowText: true,
 *   allowTargetBlank: true
 * })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A link field model.
 */
export const link = (config?: LinkFieldConfig): CustomTypeModelLinkField => {
	return {
		type: CustomTypeModelFieldType.Link,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
			select: config?.select,
			allowText: config?.allowText,
			allowTargetBlank: config?.allowTargetBlank,
			repeat: config?.repeat,
			variants: config?.variants,
		},
	}
}
