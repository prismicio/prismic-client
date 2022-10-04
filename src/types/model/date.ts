import type { CustomTypeModelFieldType } from "./types";

/**
 * A Date Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/date}
 */
export interface CustomTypeModelDateField {
	type: typeof CustomTypeModelFieldType.Date;
	config?: {
		label?: string | null;
		placeholder?: string;
		default?: string;
	};
}
