import type { CustomTypeModelFieldType } from "./types";

/**
 * An integration custom type field.
 *
 * More details: {@link https://prismic.io/docs/integration-fields}
 */
export interface CustomTypeModelIntegrationField {
	type: typeof CustomTypeModelFieldType.Integration;
	config?: {
		label?: string | null;
		placeholder?: string;
		catalog?: string;
	};
}
