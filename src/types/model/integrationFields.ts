import type { CustomTypeModelFieldType } from "./types";

/**
 * An integration custom type field.
 *
 * More details: {@link https://prismic.io/docs/integration-fields}
 */
export interface CustomTypeModelIntegrationFieldsField {
	type: typeof CustomTypeModelFieldType.IntegrationFields;
	config?: {
		label?: string | null;
		placeholder?: string;
		catalog?: string;
	};
}
