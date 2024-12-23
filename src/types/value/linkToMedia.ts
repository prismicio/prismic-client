import type { FieldState } from "./types"

/**
 * A link field that points to media.
 *
 * @typeParam State - State of the field which determines its shape.
 */
export type LinkToMediaField<State extends FieldState = FieldState> =
	State extends "empty" ? EmptyLinkToMediaField : FilledLinkToMediaField

type EmptyLinkToMediaField = {
	link_type: "Any"
	text?: string
}

/**
 * A link that points to media.
 */
export interface FilledLinkToMediaField {
	id: string
	link_type: "Media"
	name: string
	kind: string
	url: string
	size: string
	height?: string | null
	width?: string | null
	text?: string
}
