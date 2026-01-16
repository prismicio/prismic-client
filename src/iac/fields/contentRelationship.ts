import type { CustomTypeModelContentRelationshipField } from "../../types/model/contentRelationship"
import { CustomTypeModelFieldType } from "../../types/model/types"
import { CustomTypeModelLinkSelectType } from "../../types/model/link"

/**
 * Configuration for a content relationship field.
 */
export interface ContentRelationshipFieldConfig<
	CustomTypes extends string = string,
	Tags extends string = string,
> {
	label?: string | null
	placeholder?: string
	/**
	 * Custom types to allow linking to.
	 *
	 * @example ["blog_post", "author"] as const
	 */
	customtypes?: readonly CustomTypes[]
	/**
	 * Tags to filter by.
	 *
	 * @example ["featured"] as const
	 */
	tags?: readonly Tags[]
}

/**
 * Creates a content relationship field model.
 *
 * @example
 *
 * ```ts
 * // Any document
 * model.contentRelationship({ label: "Related Content" })
 *
 * // Specific custom types (type-safe)
 * model.contentRelationship({
 *   label: "Author",
 *   customtypes: ["author", "contributor"] as const
 * })
 *
 * // With tag filtering
 * model.contentRelationship({
 *   label: "Featured Post",
 *   customtypes: ["blog_post"] as const,
 *   tags: ["featured"] as const
 * })
 * ```
 *
 * @typeParam CustomTypes - Custom type ID literals for type inference.
 * @typeParam Tags - Tag literals for type inference.
 *
 * @param config - Configuration for the field.
 *
 * @returns A content relationship field model.
 */
export const contentRelationship = <
	CustomTypes extends string = string,
	Tags extends string = string,
>(
	config?: ContentRelationshipFieldConfig<CustomTypes, Tags>,
): CustomTypeModelContentRelationshipField<CustomTypes, Tags> => {
	return {
		type: CustomTypeModelFieldType.Link,
		config: {
			label: config?.label ?? null,
			placeholder: config?.placeholder,
			select: CustomTypeModelLinkSelectType.Document,
			customtypes: config?.customtypes,
			tags: config?.tags,
		},
	}
}
