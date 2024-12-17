import type { LinkType, OptionalLinkProperties } from "../value/link"

/**
 * Adds `OptionalLinkProperties` to any type that looks like a link object (one
 * that includes a valid `link_type` property).
 *
 * @example
 *
 * ```ts
 * type Example = MaybeLink<PrismicDocument | LinkField>
 * // PrismicDocument | (LinkField & OptionalLinkProperties)
 * ```
 *
 * @typeParam T - The type to augment.
 */
export type MaybeLink<T> =
	| Exclude<T, { link_type: (typeof LinkType)[keyof typeof LinkType] }>
	| (Extract<T, { link_type: (typeof LinkType)[keyof typeof LinkType] }> &
			OptionalLinkProperties)
