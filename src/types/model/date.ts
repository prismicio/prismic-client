import type { CustomTypeModelFieldType } from "./types";

/**
 * A date custom type field.
 *
 * More details: {@link https://prismic.io/docs/date}
 */
export interface CustomTypeModelDateField {
	type: typeof CustomTypeModelFieldType.Date;
	config?: {
		label?: string | null;
		placeholder?: string;
		default?: string;
	};
}
