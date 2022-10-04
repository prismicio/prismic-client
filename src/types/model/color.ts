import type { CustomTypeModelFieldType } from "./types";

/**
 * A Color Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/color}
 */
export interface CustomTypeModelColorField {
	type: typeof CustomTypeModelFieldType.Color;
	config?: {
		label?: string | null;
		placeholder?: string;
	};
}
