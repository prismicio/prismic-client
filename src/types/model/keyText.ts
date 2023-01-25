import type { CustomTypeModelFieldType } from "./types";

/**
 * A Key Text Custom Type field.
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
