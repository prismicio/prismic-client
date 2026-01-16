import type { CustomTypeModelIntegrationField } from "../../types/model/integration"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for an integration field.
 */
export interface IntegrationFieldConfig {
	label?: string | null
	placeholder?: string
	/**
	 * The catalog ID for the integration.
	 */
	catalog?: string
}

/**
 * Creates an integration field model.
 *
 * @example
 *
 * ```ts
 * model.integration({
 *   label: "Product",
 *   catalog: "my-catalog-id"
 * })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns An integration field model.
 */
export const integration = (
	config?: IntegrationFieldConfig,
): CustomTypeModelIntegrationField => {
	return {
		type: CustomTypeModelFieldType.Integration,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
			catalog: config?.catalog,
		},
	}
}
