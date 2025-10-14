import type { SharedSliceModelVariation } from "./sharedSliceVariation.ts"
import type { CustomTypeModelSliceType } from "./sliceZone.ts"

/**
 * A Prismic shared Slice model.
 *
 * More details: {@link https://prismic.io/docs/slice}
 *
 * @typeParam Variation - A variation for the shared Slice.
 */
export interface SharedSliceModel<
	ID extends string = string,
	Variation extends SharedSliceModelVariation = SharedSliceModelVariation,
> {
	type: typeof CustomTypeModelSliceType.SharedSlice
	id: ID
	name: string
	description?: string
	variations: readonly Variation[]
}
