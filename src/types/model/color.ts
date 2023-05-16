import type { CustomTypeModelFieldType } from "./types";

/**
 * A color custom type field.
 *
 * More details: {@link https://prismic.io/docs/color}
 */
export interface CustomTypeModelColorField {
	type: typeof CustomTypeModelFieldType.Color;
	config?: {
		label?: string | null;
		placeholder?: string;
	};
}
