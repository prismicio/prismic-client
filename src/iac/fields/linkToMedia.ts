import type { CustomTypeModelLinkToMediaField } from "../../types/model/linkToMedia"
import { CustomTypeModelFieldType } from "../../types/model/types"
import { CustomTypeModelLinkSelectType } from "../../types/model/link"

/**
 * Configuration for a link to media field.
 */
export interface LinkToMediaFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates a link to media field model.
 *
 * @example
 *
 * ```ts
 * model.linkToMedia({ label: "Download File" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A link to media field model.
 */
export const linkToMedia = (
	config?: LinkToMediaFieldConfig,
): CustomTypeModelLinkToMediaField => {
	return {
		type: CustomTypeModelFieldType.Link,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
			select: CustomTypeModelLinkSelectType.Media,
		},
	}
}
