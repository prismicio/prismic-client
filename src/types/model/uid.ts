import type { CustomTypeModelFieldType } from "./types";

/**
 * A UID Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/uid}
 */
export interface CustomTypeModelUIDField {
	type: typeof CustomTypeModelFieldType.UID;
	config?: {
		label?: string | null;
		placeholder?: string;
	};
}
