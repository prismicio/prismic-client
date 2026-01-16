import type { SharedSliceModelVariation } from "../types/model/sharedSliceVariation"
import type {
	CustomTypeModelFieldForNestedGroup,
	CustomTypeModelFieldForSlicePrimary,
} from "../types/model/types"

/**
 * Configuration for a slice variation.
 */
export interface VariationConfig<
	ID extends string = string,
	PrimaryFields extends Record<
		string,
		CustomTypeModelFieldForSlicePrimary
	> = Record<string, CustomTypeModelFieldForSlicePrimary>,
	ItemFields extends Record<
		string,
		CustomTypeModelFieldForNestedGroup
	> = Record<string, CustomTypeModelFieldForNestedGroup>,
> {
	/**
	 * The API ID of the variation.
	 */
	id: ID
	/**
	 * The human-readable name of the variation.
	 */
	name: string
	/**
	 * Description of the variation.
	 */
	description?: string
	/**
	 * Documentation URL for the variation.
	 */
	docURL?: string
	/**
	 * Version of the variation.
	 *
	 * @defaultValue `"initial"`
	 */
	version?: string
	/**
	 * Screenshot URL for the variation.
	 */
	imageUrl?: string
	/**
	 * Non-repeatable fields (primary zone).
	 */
	primary?: PrimaryFields
	/**
	 * Repeatable fields (items zone).
	 */
	items?: ItemFields
}

/**
 * Creates a slice variation model.
 *
 * @example
 *
 * ```ts
 * model.variation({
 *   id: "default",
 *   name: "Default",
 *   primary: {
 *     title: model.richText({ label: "Title", single: "heading1" }),
 *     description: model.richText({ label: "Description" })
 *   },
 *   items: {
 *     image: model.image({ label: "Image" })
 *   }
 * })
 * ```
 *
 * @typeParam ID - Variation ID literal for type inference.
 * @typeParam PrimaryFields - Primary fields definition for type inference.
 * @typeParam ItemFields - Item fields definition for type inference.
 *
 * @param config - Configuration for the variation.
 *
 * @returns A slice variation model.
 */
export const variation = <
	ID extends string,
	PrimaryFields extends Record<
		string,
		CustomTypeModelFieldForSlicePrimary
	> = Record<string, CustomTypeModelFieldForSlicePrimary>,
	ItemFields extends Record<
		string,
		CustomTypeModelFieldForNestedGroup
	> = Record<string, CustomTypeModelFieldForNestedGroup>,
>(
	config: VariationConfig<ID, PrimaryFields, ItemFields>,
): SharedSliceModelVariation<ID, PrimaryFields, ItemFields> => {
	return {
		id: config.id,
		name: config.name,
		description: config.description ?? config.name,
		docURL: config.docURL ?? "",
		version: config.version ?? "initial",
		imageUrl: config.imageUrl ?? "",
		primary: config.primary,
		items: config.items,
	}
}
