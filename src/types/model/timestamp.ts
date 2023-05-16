import type { CustomTypeModelFieldType } from "./types";

/**
 * A timestamp custom type field.
 *
 * More details: {@link https://prismic.io/docs/timestamp}
 */
export interface CustomTypeModelTimestampField {
	type: typeof CustomTypeModelFieldType.Timestamp;
	config?: {
		label?: string | null;
		placeholder?: string;
		default?: string;
	};
}
