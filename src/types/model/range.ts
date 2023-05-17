import type { CustomTypeModelFieldType } from "./types";

/**
 * @deprecated - Legacy field. Use `CustomTypeModelNumberField` instead.
 */
export interface CustomTypeModelRangeField {
	type: typeof CustomTypeModelFieldType.Range;
	config?: {
		label?: string | null;
		placeholder?: string;
		min?: number;
		max?: number;
		step?: number;
	};
}
