import type { CustomTypeModelFieldType } from "./types";

import type { CustomTypeModelLegacySlice, CustomTypeModelSlice } from "./slice";

/**
 * A Slice Zone custom type field.
 *
 * More details: {@link https://prismic.io/docs/slice}
 */
export interface CustomTypeModelSliceZoneField<
	Slices extends Record<
		string,
		| CustomTypeModelSlice
		| CustomTypeModelSharedSlice
		| CustomTypeModelLegacySlice
	> = Record<
		string,
		| CustomTypeModelSlice
		| CustomTypeModelSharedSlice
		| CustomTypeModelLegacySlice
	>,
> {
	type:
		| typeof CustomTypeModelFieldType.Slices
		| typeof CustomTypeModelFieldType.LegacySlices;
	fieldset?: string | null;
	config?: {
		labels?: Record<string, readonly CustomTypeModelSliceLabel[]> | null;
		choices?: Slices;
	};
}

/**
 * Label for a Slice.
 *
 * More details: {@link https://prismic.io/docs/slice}
 */
export interface CustomTypeModelSliceLabel {
	name: string;
	display?: string;
}

/**
 * Type identifier for a Slice.
 *
 * More details: {@link https://prismic.io/docs/slice}
 */
export const CustomTypeModelSliceType = {
	Slice: "Slice",
	SharedSlice: "SharedSlice",
} as const;

/**
 * A shared Slice for a custom type.
 *
 * More details: {@link https://prismic.io/docs/slice}
 */
export interface CustomTypeModelSharedSlice {
	type: typeof CustomTypeModelSliceType.SharedSlice;
}
