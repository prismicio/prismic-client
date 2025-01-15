import type { AnyRegularField, FieldState } from "./types"

import type { FilledContentRelationshipField } from "./contentRelationship"
import type { GroupField } from "./group"
import type { FilledLinkToMediaField } from "./linkToMedia"
import type { SliceZone } from "./sliceZone"

/**
 * Link types
 */
export const LinkType = {
	Any: "Any",
	Document: "Document",
	Media: "Media",
	Web: "Web",
} as const

/**
 * A link field.
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled via the
 *   `fetchLinks` or `graphQuery` query parameter).
 * @typeParam State - State of the field which determines its shape.
 * @typeParam VariantEnum - Variants of the link.
 */
export type LinkField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	State extends FieldState = FieldState,
	VariantEnum = string,
> = State extends "empty"
	? EmptyLinkField<typeof LinkType.Any, VariantEnum>
	: FilledLinkField<TypeEnum, LangEnum, DataInterface, VariantEnum>

/**
 * A link field that is filled.
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled via the
 *   `fetchLinks` or `graphQuery` query parameter).
 * @typeParam VariantEnum - Variants of the link.
 */
export type FilledLinkField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	VariantEnum = string,
> =
	| (FilledContentRelationshipField<TypeEnum, LangEnum, DataInterface> &
			OptionalLinkProperties<VariantEnum>)
	| FilledLinkToMediaField<VariantEnum>
	| FilledLinkToWebField<VariantEnum>

/**
 * A link field that is not filled.
 *
 * @typeParam _Unused - THIS PARAMETER IS NOT USED. If you are passing a type,
 *   **please remove it**.
 * @typeParam VariantEnum - Variants of the link.
 */
export type EmptyLinkField<
	_Unused extends
		(typeof LinkType)[keyof typeof LinkType] = typeof LinkType.Any,
	VariantEnum = string,
> = {
	link_type: "Any"
} & OptionalLinkProperties<VariantEnum>

/**
 * A link field pointing to a relative or absolute URL.
 *
 * @typeParam VariantEnum - Variants of the link.
 */
export type FilledLinkToWebField<VariantEnum = string> = {
	link_type: "Web"
	url: string
	target?: string
} & OptionalLinkProperties<VariantEnum>

/**
 * Optional properties available to link fields. It is used to augment existing
 * link-like fields (like content relationship fields) with field-specific
 * properties.
 *
 * @typeParam VariantEnum - Variants of the link.
 *
 * @internal
 */
// Remember to update the `getOptionalLinkProperties()` function when updating
// this type. The function should check for every property.
export type OptionalLinkProperties<VariantEnum = string> = {
	text?: string
	variant?: VariantEnum
}
