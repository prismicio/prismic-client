import type { CustomTypeModelFieldType } from "./types";

/**
 * A key text custom type field.
 *
 * More details: {@link https://prismic.io/docs/key-text}
 */
export interface CustomTypeModelKeyTextField {
	type: typeof CustomTypeModelFieldType.Text;
	config?: {
		label?: string | null;
		placeholder?: string;
	};
}
