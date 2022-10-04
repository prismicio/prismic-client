import type { CustomTypeModelFieldType } from "./types";
import type { CustomTypeModelLegacySlice, CustomTypeModelSlice } from "./slice";

/**
 * A Slice Zone Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/slices}
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
 * More details: {@link https://prismic.io/docs/core-concepts/slices}
 */
export interface CustomTypeModelSliceLabel {
	name: string;
	display?: string;
}

/**
 * Type identifier for a Slice.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/slices}
 */
export const CustomTypeModelSliceType = {
	Slice: "Slice",
	SharedSlice: "SharedSlice",
} as const;

/**
 * A Shared Slice for a Custom Type.
 *
 * More details:
 *
 * - {@link https://prismic.io/docs/core-concepts/slices}
 * - {@link https://prismic.io/docs/core-concepts/reusing-slices}
 */
export interface CustomTypeModelSharedSlice {
	type: typeof CustomTypeModelSliceType.SharedSlice;
}
