import type { CustomTypeModelFieldType } from "./types";
import type { CustomTypeModelLinkSelectType } from "./link";

/**
 * A Link to Media Custom Type field.
 *
 * More details:
 * {@link https://prismic.io/docs/core-concepts/link-content-relationship}
 */
export interface CustomTypeModelLinkToMediaField {
	type: typeof CustomTypeModelFieldType.Link;
	config?: {
		label?: string | null;
		placeholder?: string;
		select: typeof CustomTypeModelLinkSelectType.Media;
	};
}
