import type {
	SharedSliceVariation,
	SharedSliceVariationBase,
} from "./sharedSliceVariation";

/**
 * A shared Slice.
 *
 * @see More details: {@link https://prismic.io/docs/slice}
 */
export type SharedSlice<
	SliceType = string,
	Variations extends SharedSliceVariationBase = SharedSliceVariation,
> = {
	slice_type: SliceType;
	slice_label: null;
	id: string;
} & Variations;
