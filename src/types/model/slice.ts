import type { CustomTypeModelGroupField } from "./group";
import type { CustomTypeModelSliceType } from "./sliceZone";
import type { CustomTypeModelFieldForGroup } from "./types";

/**
 * A Slice for a Custom Type.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/slices}
 *
 * @typeParam NonRepeatFields - A record of fields that cannnot be repeated.
 * @typeParam RepeatFields - A record of fields that can be repeated.
 */
export interface CustomTypeModelSlice<
	NonRepeatFields extends Record<string, CustomTypeModelFieldForGroup> = Record<
		string,
		CustomTypeModelFieldForGroup
	>,
	RepeatFields extends Record<string, CustomTypeModelFieldForGroup> = Record<
		string,
		CustomTypeModelFieldForGroup
	>,
> {
	type: typeof CustomTypeModelSliceType.Slice;
	fieldset?: string | null;
	description?: string;
	icon?: string;
	display?:
		| typeof CustomTypeModelSliceDisplay[keyof typeof CustomTypeModelSliceDisplay]
		| string;
	"non-repeat"?: NonRepeatFields;
	repeat?: RepeatFields;
}

/**
 * Display type for a Slice.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/slices}
 */
export const CustomTypeModelSliceDisplay = {
	List: "list",
	Grid: "grid",
} as const;

/**
 * @deprecated - Legacy slice type. Do not use.
 */
export type CustomTypeModelLegacySlice =
	| CustomTypeModelGroupField
	| CustomTypeModelFieldForGroup;
