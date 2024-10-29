import type { FieldState } from "./types"

import type { EmptyLinkField, LinkType } from "./link"

/**
 * A single link field value that points to media.
 *
 * @typeParam State - State of the field which determines its shape.
 */
export type SingleLinkToMediaField<State extends FieldState = FieldState> =
	State extends "empty"
		? EmptyLinkField<typeof LinkType.Media>
		: FilledLinkToMediaField

/**
 * Repeatable link field values that point to media.
 *
 * @typeParam State - State of the field which determines its shape.
 */
export type RepeatableLinkToMediaField<State extends FieldState = FieldState> =
	State extends "empty"
		? []
		: [SingleLinkToMediaField, ...SingleLinkToMediaField[]]

/**
 * A link field that points to media.
 *
 * @typeParam State - State of the field which determines its shape.
 */
export type LinkToMediaField<State extends FieldState = FieldState> =
	| SingleLinkToMediaField<State>
	| RepeatableLinkToMediaField<State>

/**
 * A link that points to media.
 */
export interface FilledLinkToMediaField {
	id: string
	link_type: typeof LinkType.Media
	name: string
	kind: string
	url: string
	size: string
	height?: string | null
	width?: string | null
	text?: string
}
