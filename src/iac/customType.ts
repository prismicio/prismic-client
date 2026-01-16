import type {
	CustomTypeModel,
	CustomTypeModelDefinition,
} from "../types/model/customType"

/**
 * Configuration for a custom type.
 */
export interface CustomTypeConfig<
	ID extends string = string,
	Definition extends CustomTypeModelDefinition = CustomTypeModelDefinition,
> {
	/**
	 * The API ID of the custom type.
	 */
	id: ID
	/**
	 * The human-readable name of the custom type.
	 */
	label?: string | null
	/**
	 * Whether multiple documents of this type can be created.
	 */
	repeatable: boolean
	/**
	 * The format of the custom type.
	 *
	 * - `"page"` - A page type (has a URL).
	 * - `"custom"` - A custom type (no URL).
	 *
	 * @defaultValue `"custom"`
	 */
	format?: "page" | "custom"
	/**
	 * Whether new documents for this type can be created.
	 *
	 * @defaultValue `true`
	 */
	status?: boolean
	/**
	 * The tabs and fields definition for this custom type.
	 */
	json: Definition
}

/**
 * Creates a custom type model.
 *
 * @example
 *
 * ```ts
 * const blogPost = model.customType({
 *   id: "blog_post",
 *   label: "Blog Post",
 *   repeatable: true,
 *   format: "page",
 *   json: {
 *     Main: {
 *       uid: model.uid({ label: "UID" }),
 *       title: model.richText({ label: "Title", single: "heading1" }),
 *       featured_image: model.image({ label: "Featured Image" }),
 *       body: model.sliceZone({
 *         choices: {
 *           hero: { type: "SharedSlice" },
 *           text_block: { type: "SharedSlice" }
 *         }
 *       })
 *     },
 *     SEO: {
 *       meta_title: model.text({ label: "Meta Title" }),
 *       meta_description: model.text({ label: "Meta Description" })
 *     }
 *   }
 * })
 * ```
 *
 * @typeParam ID - Custom type ID literal for type inference.
 * @typeParam Definition - Tabs and fields definition for type inference.
 *
 * @param config - Configuration for the custom type.
 *
 * @returns A custom type model.
 */
export const customType = <
	ID extends string,
	Definition extends CustomTypeModelDefinition,
>(
	config: CustomTypeConfig<ID, Definition>,
): CustomTypeModel<ID, Definition> => {
	return {
		id: config.id,
		label: config.label ?? null,
		repeatable: config.repeatable,
		format: config.format,
		status: config.status ?? true,
		json: config.json,
	}
}
