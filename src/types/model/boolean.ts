import type { CustomTypeModelFieldType } from "./types";

/**
 * A Boolean Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/boolean}
 */
export interface CustomTypeModelBooleanField {
	type: typeof CustomTypeModelFieldType.Boolean;
	config?: {
		label?: string | null;
		default_value?: boolean;
		placeholder_true?: string;
		placeholder_false?: string;
	};
}
