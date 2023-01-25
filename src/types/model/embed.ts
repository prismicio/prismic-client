import type { CustomTypeModelFieldType } from "./types";

/**
 * An Embed Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/embed}
 */
export interface CustomTypeModelEmbedField {
	type: typeof CustomTypeModelFieldType.Embed;
	config?: {
		label?: string | null;
		placeholder?: string;
	};
}
