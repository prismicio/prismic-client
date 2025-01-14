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
 */
export type LinkField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	State extends FieldState = FieldState,
> = State extends "empty"
	? EmptyLinkField
	: FilledLinkField<TypeEnum, LangEnum, DataInterface>

/**
 * A link field that is filled.
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled via the
 *   `fetchLinks` or `graphQuery` query parameter).
 */
export type FilledLinkField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
> = (
	| FilledContentRelationshipField<TypeEnum, LangEnum, DataInterface>
	| FilledLinkToMediaField
	| FilledLinkToWebField
) &
	OptionalLinkProperties

/**
 * A link field that is not filled.
 *
 * @typeParam _Unused - THIS PARAMETER IS NOT USED. If you are passing a type,
 *   **please remove it**.
 */
export type EmptyLinkField<
	_Unused extends
		(typeof LinkType)[keyof typeof LinkType] = typeof LinkType.Any,
> = {
	link_type: "Any"
} & OptionalLinkProperties

/**
 * A link field pointing to a relative or absolute URL.
 */
export type FilledLinkToWebField = {
	link_type: "Web"
	url: string
	target?: string
} & OptionalLinkProperties

/**
 * Optional properties available to link fields. It is used to augment existing
 * link-like fields (like content relationship fields) with field-specific
 * properties.
 *
 * @internal
 */
// Remember to update the `getOptionalLinkProperties()` function when updating
// this type. The function should check for every property.
export type OptionalLinkProperties = {
	text?: string
	variant?: string
}
