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
 * @typeParam Variant - Variants of the link.
 */
export type LinkField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	State extends FieldState = FieldState,
	Variant = string,
> = State extends "empty"
	? EmptyLinkField<typeof LinkType.Any, Variant>
	: FilledLinkField<TypeEnum, LangEnum, DataInterface, Variant>

/**
 * A link field that is filled.
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled via the
 *   `fetchLinks` or `graphQuery` query parameter).
 * @typeParam Variant - Variants of the link.
 */
export type FilledLinkField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	Variant = string,
> =
	| (FilledContentRelationshipField<TypeEnum, LangEnum, DataInterface> &
			OptionalLinkProperties<Variant>)
	| FilledLinkToMediaField<Variant>
	| FilledLinkToWebField<Variant>

/**
 * A link field that is not filled.
 *
 * @typeParam _Unused - THIS PARAMETER IS NOT USED. If you are passing a type,
 *   **please remove it**.
 * @typeParam Variant - Variants of the link.
 */
export type EmptyLinkField<
	_Unused extends
		(typeof LinkType)[keyof typeof LinkType] = typeof LinkType.Any,
	Variant = string,
> = {
	link_type: "Any"
} & OptionalLinkProperties<Variant>

/**
 * A link field pointing to a relative or absolute URL.
 *
 * @typeParam Variant - Variants of the link.
 */
export type FilledLinkToWebField<Variant = string> = {
	link_type: "Web"
	url: string
	target?: string
} & OptionalLinkProperties<Variant>

/**
 * Optional properties available to link fields. It is used to augment existing
 * link-like fields (like content relationship fields) with field-specific
 * properties.
 *
 * @typeParam Variant - Variants of the link.
 *
 * @internal
 */
// Remember to update the `getOptionalLinkProperties()` function when updating
// this type. The function should check for every property.
export type OptionalLinkProperties<Variant = string> = {
	text?: string
	variant?: Variant
}
