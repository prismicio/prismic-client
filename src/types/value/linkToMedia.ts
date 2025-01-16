import type { FieldState } from "./types"

import type { OptionalLinkProperties } from "./link"

/**
 * A link field that points to media.
 *
 * @typeParam State - State of the field which determines its shape.
 * @typeParam Variant - Variants of the link.
 */
export type LinkToMediaField<
	State extends FieldState = FieldState,
	Variant = string,
> = State extends "empty"
	? EmptyLinkToMediaField<Variant>
	: FilledLinkToMediaField<Variant>

type EmptyLinkToMediaField<Variant = string> = {
	link_type: "Any"
} & OptionalLinkProperties<Variant>

/**
 * A link that points to media.
 *
 * @typeParam Variant - Variants of the link.
 */
export type FilledLinkToMediaField<Variant = string> = {
	id: string
	link_type: "Media"
	name: string
	kind: string
	url: string
	size: string
	height?: string | null
	width?: string | null
} & OptionalLinkProperties<Variant>
