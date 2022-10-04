import type { CustomTypeModelSliceType } from "./sliceZone";
import type { SharedSliceModelVariation } from "./sharedSliceVariation";

/**
 * A Prismic Shared Slice model.
 *
 * More details:
 *
 * - {@link https://prismic.io/docs/core-concepts/slices}
 * - {@link https://prismic.io/docs/core-concepts/reusing-slices}
 *
 * @typeParam Variation - A variation for the Shared Slice.
 */
export interface SharedSliceModel<
	ID extends string = string,
	Variation extends SharedSliceModelVariation = SharedSliceModelVariation,
> {
	type: typeof CustomTypeModelSliceType.SharedSlice;
	id: ID;
	name: string;
	description?: string;
	variations: readonly Variation[];
}
