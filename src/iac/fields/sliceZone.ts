import type {
	CustomTypeModelSliceZoneField,
	CustomTypeModelSliceLabel,
	CustomTypeModelSharedSlice,
} from "../../types/model/sliceZone"
import type {
	CustomTypeModelSlice,
	CustomTypeModelLegacySlice,
} from "../../types/model/slice"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a slice zone field.
 */
export interface SliceZoneFieldConfig<
	Slices extends Record<
		string,
		CustomTypeModelSlice | CustomTypeModelSharedSlice | CustomTypeModelLegacySlice
	> = Record<
		string,
		CustomTypeModelSlice | CustomTypeModelSharedSlice | CustomTypeModelLegacySlice
	>,
> {
	/**
	 * Slice choices available in this slice zone.
	 *
	 * @example
	 *
	 * ```ts
	 * choices: {
	 *   hero: { type: "SharedSlice" },
	 *   text_block: { type: "SharedSlice" }
	 * }
	 * ```
	 */
	choices?: Slices
	/**
	 * Labels for slices.
	 */
	labels?: Record<string, readonly CustomTypeModelSliceLabel[]> | null
}

/**
 * Creates a slice zone field model.
 *
 * @example
 *
 * ```ts
 * model.sliceZone({
 *   choices: {
 *     hero: { type: "SharedSlice" },
 *     text_block: { type: "SharedSlice" },
 *     image_gallery: { type: "SharedSlice" }
 *   }
 * })
 * ```
 *
 * @typeParam Slices - Slice definitions for type inference.
 *
 * @param config - Configuration for the field.
 *
 * @returns A slice zone field model.
 */
export const sliceZone = <
	Slices extends Record<
		string,
		CustomTypeModelSlice | CustomTypeModelSharedSlice | CustomTypeModelLegacySlice
	> = Record<
		string,
		CustomTypeModelSlice | CustomTypeModelSharedSlice | CustomTypeModelLegacySlice
	>,
>(
	config?: SliceZoneFieldConfig<Slices>,
): CustomTypeModelSliceZoneField<Slices> => {
	return {
		type: CustomTypeModelFieldType.Slices,
		config: {
			choices: config?.choices,
			labels: config?.labels,
		},
	}
}
