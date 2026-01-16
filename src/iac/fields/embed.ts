import type { CustomTypeModelEmbedField } from "../../types/model/embed"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for an embed field.
 */
export interface EmbedFieldConfig {
	label?: string | null
	placeholder?: string
}

/**
 * Creates an embed field model.
 *
 * @example
 *
 * ```ts
 * model.embed({ label: "Video" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns An embed field model.
 */
export const embed = (config?: EmbedFieldConfig): CustomTypeModelEmbedField => {
	return {
		type: CustomTypeModelFieldType.Embed,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
		},
	}
}
