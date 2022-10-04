import type { CustomTypeModelFieldType } from "./types";

/**
 * An Integration Fields Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/integration-fields}
 */
export interface CustomTypeModelIntegrationFieldsField {
	type: typeof CustomTypeModelFieldType.IntegrationFields;
	config?: {
		label?: string | null;
		placeholder?: string;
		catalog?: string;
	};
}
