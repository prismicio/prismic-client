import type { CustomTypeModelFieldType } from "./types";

/**
 * @deprecated - Legacy field. Do not use.
 */
export interface CustomTypeModelSeparatorField {
	type: typeof CustomTypeModelFieldType.Separator;
	config?: {
		label?: string | null;
	};
}
