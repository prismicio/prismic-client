import type { CustomTypeModelFieldType } from "./types";

/**
 * A Number Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/number}
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
