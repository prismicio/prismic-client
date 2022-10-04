import type { SharedSliceVariation } from "./sharedSliceVariation";

/**
 * Shared Slice
 *
 * @see More details: {@link https://prismic.io/docs/core-concepts/reusing-slices#shared-slices}
 */
export type SharedSlice<
	SliceType = string,
	Variations extends SharedSliceVariation = SharedSliceVariation,
> = {
	slice_type: SliceType;
	slice_label: null;
	id?: string;
} & Variations;
