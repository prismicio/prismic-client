import type { FieldState } from "./types"

/**
 * A timestamp field.
 *
 * @typeParam State - State of the field which determines its shape.
 */
export type TimestampField<State extends FieldState = FieldState> =
	State extends "empty" ? null : string
