import type { CustomTypeModelFieldType } from "./types";

/**
 * A UID custom type field.
 *
 * More details: {@link https://prismic.io/docs/uid}
 */
export interface CustomTypeModelUIDField {
	type: typeof CustomTypeModelFieldType.UID;
	config?: {
		label?: string | null;
		placeholder?: string;
	};
}
