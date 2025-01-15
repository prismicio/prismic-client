import type { FieldState } from "./types"

import type { OptionalLinkProperties } from "./link"

/**
 * A link field that points to media.
 *
 * @typeParam State - State of the field which determines its shape.
 * @typeParam VariantEnum - Variants of the link.
 */
export type LinkToMediaField<
	State extends FieldState = FieldState,
	VariantEnum = string,
> = State extends "empty"
	? EmptyLinkToMediaField<VariantEnum>
	: FilledLinkToMediaField<VariantEnum>

type EmptyLinkToMediaField<VariantEnum = string> = {
	link_type: "Any"
} & OptionalLinkProperties<VariantEnum>

/**
 * A link that points to media.
 *
 * @typeParam VariantEnum - Variants of the link.
 */
export type FilledLinkToMediaField<VariantEnum = string> = {
	id: string
	link_type: "Media"
	name: string
	kind: string
	url: string
	size: string
	height?: string | null
	width?: string | null
} & OptionalLinkProperties<VariantEnum>
