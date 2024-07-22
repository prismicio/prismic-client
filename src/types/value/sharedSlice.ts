import type { SharedSliceVariation } from "./sharedSliceVariation";

/**
 * A shared Slice.
 *
 * @see More details: {@link https://prismic.io/docs/slice}
 */
export type SharedSlice<
	SliceType = string,
	Variations extends SharedSliceVariation = SharedSliceVariation,
> = {
	slice_type: SliceType;
	slice_label: null;
	id: string;
} & Variations;
