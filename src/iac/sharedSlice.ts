import type { SharedSliceModel } from "../types/model/sharedSlice"
import type { SharedSliceModelVariation } from "../types/model/sharedSliceVariation"
import { CustomTypeModelSliceType } from "../types/model/sliceZone"

/**
 * Configuration for a shared slice.
 */
export interface SharedSliceConfig<
	ID extends string = string,
	Variation extends SharedSliceModelVariation = SharedSliceModelVariation,
> {
	/**
	 * The API ID of the shared slice.
	 */
	id: ID
	/**
	 * The human-readable name of the shared slice.
	 */
	name: string
	/**
	 * Description of the shared slice.
	 */
	description?: string
	/**
	 * Variations of the shared slice.
	 */
	variations: readonly Variation[]
}

/**
 * Creates a shared slice model.
 *
 * @example
 *
 * ```ts
 * const hero = model.sharedSlice({
 *   id: "hero",
 *   name: "Hero",
 *   description: "A hero banner with title and image",
 *   variations: [
 *     model.variation({
 *       id: "default",
 *       name: "Default",
 *       primary: {
 *         title: model.richText({ label: "Title", single: "heading1" }),
 *         image: model.image({ label: "Background Image" })
 *       }
 *     }),
 *     model.variation({
 *       id: "withVideo",
 *       name: "With Video",
 *       primary: {
 *         title: model.richText({ label: "Title", single: "heading1" }),
 *         video: model.embed({ label: "Video" })
 *       }
 *     })
 *   ]
 * })
 * ```
 *
 * @typeParam ID - Slice ID literal for type inference.
 * @typeParam Variation - Variation types for type inference.
 *
 * @param config - Configuration for the shared slice.
 *
 * @returns A shared slice model.
 */
export const sharedSlice = <
	ID extends string,
	Variation extends SharedSliceModelVariation,
>(
	config: SharedSliceConfig<ID, Variation>,
): SharedSliceModel<ID, Variation> => {
	return {
		type: CustomTypeModelSliceType.SharedSlice,
		id: config.id,
		name: config.name,
		description: config.description,
		variations: config.variations,
	}
}
