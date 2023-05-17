import type { CustomTypeModelFieldType } from "./types";

/**
 * A number custom type field.
 *
 * More details: {@link https://prismic.io/docs/number}
 */
export interface CustomTypeModelNumberField {
	type: typeof CustomTypeModelFieldType.Number;
	config?: {
		label?: string | null;
		placeholder?: string;
		min?: number;
		max?: number;
	};
}
